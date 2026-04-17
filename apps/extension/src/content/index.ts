type FillPayload = {
  proposal: string;
};

type ExtractJobsPayload = {
  maxPages?: number;
};

type NormalizedJob = {
  job_id: string;
  title: string;
  url: string;
  category: string | null;
  budget_max: number | null;
  description: string;
  raw_text: string;
};

const SELECTORS = {
  jobCard: ".case-list-item, .case-item, .list-group-item, article, li",
  title: "a[href*='/case'], a[href*='/cases'], h2, h3",
  category: ".category, .tag, .case-category, .badge, .label, [class*='tag']",
  budget: ".budget, .price, .case-price, [class*='budget'], [class*='price']"
};

function parseBudget(text: string): number | null {
  const matches = Array.from(text.matchAll(/\d[\d,]{2,}/g));
  for (const match of matches) {
    const digits = match[0].replace(/[^\d]/g, "");
    if (!digits) {
      continue;
    }
    const value = Number(digits);
    if (Number.isFinite(value) && value >= 100 && value <= 100000000) {
      return value;
    }
  }
  return null;
}

function candidateCards(documentRef: Document): Element[] {
  const linkedTitles = Array.from(
    documentRef.querySelectorAll<HTMLAnchorElement>("a[href*='/case'], a[href*='/cases']")
  ).filter((a) => a.textContent?.trim().length);

  if (!linkedTitles.length) {
    return Array.from(documentRef.querySelectorAll(SELECTORS.jobCard));
  }

  const cards: Element[] = [];
  const seen = new Set<Element>();
  for (const link of linkedTitles) {
    const card =
      link.closest(".case-list-item, .case-item, .list-group-item, article, li, [class*='case']") ??
      link.parentElement;
    if (card && !seen.has(card)) {
      seen.add(card);
      cards.push(card);
    }
  }
  return cards;
}

function extractVisibleJobs(documentRef: Document = document): NormalizedJob[] {
  const cards = candidateCards(documentRef);
  return cards.slice(0, 30).map((card, index) => {
    const titleNode =
      card.querySelector<HTMLAnchorElement>("a[href*='/case'], a[href*='/cases']") ??
      card.querySelector<HTMLAnchorElement>(SELECTORS.title);
    const title = titleNode?.textContent?.trim() || `Untitled job ${index + 1}`;
    const href = (titleNode as HTMLAnchorElement | null)?.href || window.location.href;
    const category = card.querySelector(SELECTORS.category)?.textContent?.trim() ?? null;
    const budgetText = card.querySelector(SELECTORS.budget)?.textContent?.trim() || card.textContent || "";

    return {
      job_id: `${index}-${title.slice(0, 20)}`,
      title,
      url: href,
      category,
      budget_max: parseBudget(budgetText),
      description: card.textContent?.trim() || "",
      raw_text: card.textContent?.trim() || ""
    };
  });
}

function buildPageUrl(pageNumber: number): string {
  const current = new URL(window.location.href);
  current.searchParams.set("page", String(pageNumber));
  return current.toString();
}

function dedupeJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const deduped = new Map<string, NormalizedJob>();
  for (const job of jobs) {
    const key = job.url || job.job_id;
    if (!deduped.has(key)) {
      deduped.set(key, job);
    }
  }
  return Array.from(deduped.values());
}

async function extractJobsAcrossPages(maxPages: number): Promise<{
  jobs: NormalizedJob[];
  scannedPages: number;
}> {
  const targetPages = Math.max(1, Math.min(maxPages, 10));
  const allJobs: NormalizedJob[] = [];
  let scannedPages = 0;

  for (let page = 1; page <= targetPages; page += 1) {
    if (page === 1) {
      allJobs.push(...extractVisibleJobs(document));
      scannedPages = 1;
      continue;
    }

    const response = await fetch(buildPageUrl(page), { credentials: "include" });
    if (!response.ok) {
      break;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const jobs = extractVisibleJobs(doc);
    if (!jobs.length) {
      break;
    }
    allJobs.push(...jobs);
    scannedPages = page;
  }

  return {
    jobs: dedupeJobs(allJobs),
    scannedPages
  };
}

function extractJobDetail(documentRef: Document = document): Pick<NormalizedJob, "description" | "raw_text"> {
  const bodyText = documentRef.body?.innerText?.slice(0, 5000) || "";
  return {
    description: bodyText,
    raw_text: bodyText
  };
}

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
    const payload = (message.payload ?? {}) as ExtractJobsPayload;
    extractJobsAcrossPages(payload.maxPages ?? 1)
      .then(({ jobs, scannedPages }) => sendResponse({ jobs, scannedPages }))
      .catch((error) => sendResponse({ jobs: [], scannedPages: 1, error: String(error) }));
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
