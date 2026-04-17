import type { NormalizedJob } from "@tasker-copilot/shared";

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

export function extractVisibleJobs(documentRef: Document = document): NormalizedJob[] {
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

export function extractJobDetail(documentRef: Document = document): Pick<NormalizedJob, "description" | "raw_text"> {
  const bodyText = documentRef.body?.innerText?.slice(0, 5000) || "";
  return {
    description: bodyText,
    raw_text: bodyText
  };
}

export const TASKER_SELECTORS = SELECTORS;
