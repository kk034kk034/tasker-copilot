import type { NormalizedJob } from "@tasker-copilot/shared";

const SELECTORS = {
  jobCard: ".case-list-item, .case-item, .list-group-item",
  title: "a, h2, h3",
  category: ".category, .tag, .case-category",
  budget: ".budget, .price, .case-price"
};

function parseBudget(text: string): number | null {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export function extractVisibleJobs(documentRef: Document = document): NormalizedJob[] {
  const cards = Array.from(documentRef.querySelectorAll(SELECTORS.jobCard));
  return cards.slice(0, 30).map((card, index) => {
    const titleNode = card.querySelector(SELECTORS.title);
    const title = titleNode?.textContent?.trim() || `Untitled job ${index + 1}`;
    const href = (titleNode as HTMLAnchorElement | null)?.href || window.location.href;
    const category = card.querySelector(SELECTORS.category)?.textContent?.trim() ?? null;
    const budgetText = card.querySelector(SELECTORS.budget)?.textContent?.trim() || "";

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

export function extractJobDetail(documentRef: Document = document): Pick<NormalizedJob, "description" | "raw_text"> {
  const bodyText = documentRef.body?.innerText?.slice(0, 5000) || "";
  return {
    description: bodyText,
    raw_text: bodyText
  };
}

export const TASKER_SELECTORS = SELECTORS;
