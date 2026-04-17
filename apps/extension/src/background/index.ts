import type {
  AnalyzeJobsRequest,
  GenerateProposalRequest,
  NormalizedJob
} from "@tasker-copilot/shared";
import { apiClient } from "../shared/apiClient.js";

const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_PROD_API_BASE_URL = "https://api.your-domain.com";

chrome.runtime.onInstalled.addListener(async () => {
  const isDev = chrome.runtime.getManifest().version_name === "dev";
  const current = await chrome.storage.local.get(["apiBaseUrl", "apiKey"]);
  const currentApiBaseUrl = typeof current.apiBaseUrl === "string" ? current.apiBaseUrl.trim() : "";
  const nextApiBaseUrl =
    currentApiBaseUrl && currentApiBaseUrl !== DEFAULT_PROD_API_BASE_URL
      ? currentApiBaseUrl
      : isDev
        ? DEFAULT_DEV_API_BASE_URL
        : DEFAULT_PROD_API_BASE_URL;

  await chrome.storage.local.set({
    apiBaseUrl: nextApiBaseUrl,
    apiKey: typeof current.apiKey === "string" ? current.apiKey : ""
  });
});

async function activeTabId(): Promise<number> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.id) {
    throw new Error("No active tab available");
  }
  return tabs[0].id;
}

function isMissingReceiverError(error: unknown): boolean {
  const message = String(error);
  return message.includes("Receiving end does not exist");
}

async function sendMessageToTab<TResponse>(
  tabId: number,
  payload: unknown,
  retryAfterInject = true
): Promise<TResponse> {
  try {
    return (await chrome.tabs.sendMessage(tabId, payload)) as TResponse;
  } catch (error) {
    if (!retryAfterInject || !isMissingReceiverError(error)) {
      throw error;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content/index.js"]
    });

    return sendMessageToTab<TResponse>(tabId, payload, false);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === "ANALYZE_JOBS") {
      const tabId = await activeTabId();
      const extracted = await sendMessageToTab<{ jobs?: NormalizedJob[]; scannedPages?: number; error?: string }>(
        tabId,
        {
          type: "TASKER_EXTRACT_JOBS",
          payload: {
            maxPages: Number(message.maxPages) || 1
          }
        }
      );
      if (extracted.error) {
        sendResponse({ error: extracted.error, ranked: [], jobs: [] });
        return;
      }
      const jobs = (extracted.jobs ?? []) as NormalizedJob[];
      const payload: AnalyzeJobsRequest = { jobs };
      const result = await apiClient.scoreJobs(payload);
      sendResponse({ ...result, jobs, scannedPages: extracted.scannedPages ?? 1 });
      return;
    }

    if (message?.type === "GENERATE_PROPOSAL") {
      const payload: GenerateProposalRequest = { job: message.job as NormalizedJob };
      const result = await apiClient.generateProposal(payload);
      sendResponse(result);
      return;
    }

    if (message?.type === "FILL_PROPOSAL") {
      const tabId = await activeTabId();
      const result = await sendMessageToTab<{ filled?: boolean; message?: string }>(tabId, {
        type: "TASKER_FILL_PROPOSAL",
        proposal: message.proposal
      });
      sendResponse(result);
      return;
    }

    sendResponse({ error: "Unknown message type." });
  })().catch((error) => {
    console.error("[tasker-copilot/background]", error);
    sendResponse({ error: String(error) });
  });

  return true;
});
