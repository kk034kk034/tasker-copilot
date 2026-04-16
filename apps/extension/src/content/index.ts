import { extractJobDetail, extractVisibleJobs } from "../shared/taskerAdapter";

type FillPayload = {
  proposal: string;
};

function fillProposalForm(payload: FillPayload): { filled: boolean; message: string } {
  const textarea =
    (document.querySelector("textarea[name*='proposal']") as HTMLTextAreaElement | null) ||
    (document.querySelector("textarea") as HTMLTextAreaElement | null);

  if (!textarea) {
    return { filled: false, message: "No proposal textarea found on this page." };
  }

  textarea.focus();
  textarea.value = payload.proposal;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));

  return {
    filled: true,
    message: "Proposal fields filled. Please review manually before final submission."
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "TASKER_EXTRACT_JOBS") {
    const jobs = extractVisibleJobs();
    sendResponse({ jobs });
    return true;
  }

  if (message?.type === "TASKER_EXTRACT_DETAIL") {
    const detail = extractJobDetail();
    sendResponse({ detail });
    return true;
  }

  if (message?.type === "TASKER_FILL_PROPOSAL") {
    const result = fillProposalForm({ proposal: message.proposal || "" });
    sendResponse(result);
    return true;
  }

  return false;
});
