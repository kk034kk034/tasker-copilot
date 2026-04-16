import type { AnalyzeJobsResponse, GenerateProposalResponse, NormalizedJob } from "@tasker-copilot/shared";

type AnalyzeJobsMessageResponse = AnalyzeJobsResponse & {
  jobs?: NormalizedJob[];
  error?: string;
};

const statusEl = document.getElementById("status") as HTMLDivElement;
const resultEl = document.getElementById("result") as HTMLDivElement;
const proposalEl = document.getElementById("proposal") as HTMLTextAreaElement;

let selectedJob: NormalizedJob | null = null;
let jobMap: Record<string, NormalizedJob> = {};

function setStatus(text: string): void {
  statusEl.textContent = text;
}

function renderRankedResults(response: AnalyzeJobsMessageResponse): void {
  const ranked = response.ranked ?? [];
  const top = ranked.slice(0, 3);
  if (!top.length) {
    resultEl.innerHTML = "<em>No scored results returned.</em>";
    return;
  }

  resultEl.innerHTML = top
    .map((item, idx) => {
      const match = jobMap[item.job_id];
      const title = match?.title || item.job_id;
      const reasons = item.reasons.length ? item.reasons.join("; ") : "No explicit reasons";
      const flags = item.red_flags.length ? item.red_flags.join("; ") : "None";

      return `
        <div class="ranked-row">
          <strong>#${idx + 1} ${title}</strong><br/>
          Score: ${item.total_score}<br/>
          Reasons: ${reasons}<br/>
          Red flags: ${flags}
        </div>
      `;
    })
    .join("<hr/>");
}

(document.getElementById("analyze") as HTMLButtonElement).addEventListener("click", async () => {
  setStatus("Analyzing visible Tasker jobs...");

  const response = (await chrome.runtime.sendMessage({ type: "ANALYZE_JOBS" })) as AnalyzeJobsMessageResponse;

  if (response.error) {
    setStatus(`Error: ${response.error}`);
    return;
  }

  const extractedJobs = response.jobs ?? [];
  jobMap = Object.fromEntries(extractedJobs.map((job) => [job.job_id, job]));

  if (!response.ranked?.length) {
    setStatus("No jobs found on this page.");
    resultEl.innerHTML = "";
    return;
  }

  const topJobId = response.ranked[0].job_id;
  selectedJob = jobMap[topJobId] ?? null;
  renderRankedResults(response);
  setStatus("Analyze complete. Top recommendations shown below.");
});

(document.getElementById("generate") as HTMLButtonElement).addEventListener("click", async () => {
  if (!selectedJob) {
    setStatus("Analyze jobs first so we can choose a top match.");
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
  setStatus("Proposal generated. Edit it before filling form.");
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
