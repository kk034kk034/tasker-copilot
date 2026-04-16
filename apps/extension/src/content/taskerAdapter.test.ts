import { describe, expect, it } from "vitest";
import { extractVisibleJobs } from "../shared/taskerAdapter";

describe("tasker adapter", () => {
  it("extracts cards from dom", () => {
    document.body.innerHTML = `
      <div class="case-item">
        <a href="https://www.tasker.com.tw/case/123">Build FastAPI app</a>
        <span class="case-category">Web Development</span>
        <span class="case-price">NT$ 50,000</span>
      </div>
    `;

    const jobs = extractVisibleJobs(document);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toContain("Build FastAPI app");
  });
});
