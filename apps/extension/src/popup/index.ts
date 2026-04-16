import type { AnalyzeJobsResponse, GenerateProposalResponse, NormalizedJob } from "@tasker-copilot/shared";

const statusEl = document.getElementById("status") as HTMLDivElement;
const resultEl = document.getElementById("result") as HTMLDivElement;
const proposalEl = document.getElementById("proposal") as HTMLTextAreaElement;

let selectedJob: NormalizedJob | null = null;

function setStatus(text: string): void {
  statusEl.textContent = text;
}

(document.getElementById("analyze") as HTMLButtonElement).addEventListener("click", async () => {
  setStatus("Analyzing jobs...");
  const response = (await chrome.runtime.sendMessage({ type: "ANALYZE_JOBS" })) as AnalyzeJobsResponse & {
    error?: string;
  };

  if (response.error) {
    setStatus(`Error: ${response.error}`);
    return;
  }

  if (!response.ranked?.length) {
    setStatus("No jobs found on this page.");
    return;
  }

  const top = response.ranked[0];
  selectedJob = {
    job_id: top.job_id,
    title: `Job ${top.job_id}`,
    url: window.location.href,
    description: "",
    raw_text: ""
  };

  resultEl.innerHTML = `
    <strong>Top fit score:</strong> ${top.total_score}<br/>
    <strong>Reasons:</strong> ${top.reasons.join("; ")}<br/>
    <strong>Red flags:</strong> ${top.red_flags.join("; ") || "None"}
  `;
  setStatus("Analyze complete.");
});

(document.getElementById("generate") as HTMLButtonElement).addEventListener("click", async () => {
  if (!selectedJob) {
    setStatus("Analyze jobs first.");
    return;
  }

  setStatus("Generating proposal...");
  const response = (await chrome.runtime.sendMessage({
    type: "GENERATE_PROPOSAL",
    job: selectedJob
  })) as GenerateProposalResponse & { error?: string };

  if (response.error) {
    setStatus(`Error: ${response.error}`);
    return;
  }

  proposalEl.value = response.proposal;
  setStatus("Proposal generated. You can edit it before filling form.");
});

(document.getElementById("fill") as HTMLButtonElement).addEventListener("click", async () => {
  if (!proposalEl.value.trim()) {
    setStatus("Generate or paste proposal content first.");
    return;
  }

  const response = (await chrome.runtime.sendMessage({
    type: "FILL_PROPOSAL",
    proposal: proposalEl.value
  })) as { filled?: boolean; message?: string; error?: string };

  if (response.error) {
    setStatus(`Error: ${response.error}`);
    return;
  }

  setStatus(response.message || "Form fill attempted. Please review manually.");
});
