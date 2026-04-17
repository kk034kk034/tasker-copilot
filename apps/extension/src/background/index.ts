import type {
  AnalyzeJobsRequest,
  GenerateProposalRequest,
  NormalizedJob
} from "@tasker-copilot/shared";
import { apiClient } from "../shared/apiClient";

const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_PROD_API_BASE_URL = "https://api.your-domain.com";

chrome.runtime.onInstalled.addListener(async () => {
  const isDev = chrome.runtime.getManifest().version_name === "dev";
  const current = await chrome.storage.local.get(["apiBaseUrl", "apiKey"]);
  const nextApiBaseUrl =
    typeof current.apiBaseUrl === "string" && current.apiBaseUrl.trim()
      ? current.apiBaseUrl
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === "ANALYZE_JOBS") {
      const tabId = await activeTabId();
      const extracted = await chrome.tabs.sendMessage(tabId, { type: "TASKER_EXTRACT_JOBS" });
      const jobs = (extracted.jobs ?? []) as NormalizedJob[];
      const payload: AnalyzeJobsRequest = { jobs };
      const result = await apiClient.scoreJobs(payload);
      sendResponse({ ...result, jobs });
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
      const result = await chrome.tabs.sendMessage(tabId, {
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
