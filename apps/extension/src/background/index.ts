import type {
  AnalyzeJobsRequest,
  AnalyzeJobsResponse,
  GenerateProposalRequest,
  GenerateProposalResponse,
  NormalizedJob
} from "@tasker-copilot/shared";

const API_BASE = "http://127.0.0.1:8000";

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
      const payload: AnalyzeJobsRequest = { jobs: extracted.jobs as NormalizedJob[] };
      const res = await fetch(`${API_BASE}/v1/jobs/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await res.json()) as AnalyzeJobsResponse;
      sendResponse(json);
      return;
    }

    if (message?.type === "GENERATE_PROPOSAL") {
      const payload: GenerateProposalRequest = { job: message.job as NormalizedJob };
      const res = await fetch(`${API_BASE}/v1/proposals/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await res.json()) as GenerateProposalResponse;
      sendResponse(json);
      return;
    }

    if (message?.type === "FILL_PROPOSAL") {
      const tabId = await activeTabId();
      const result = await chrome.tabs.sendMessage(tabId, {
        type: "TASKER_FILL_PROPOSAL",
        proposal: message.proposal
      });
      sendResponse(result);
    }
  })().catch((error) => {
    sendResponse({ error: String(error) });
  });

  return true;
});
