import { describe, expect, it } from "vitest";
import type { AnalyzeJobsRequest } from "../src/types";

describe("shared types", () => {
  it("accepts normalized analyze payload shape", () => {
    const payload: AnalyzeJobsRequest = {
      jobs: [
        {
          job_id: "1",
          title: "Job",
          url: "https://example.com",
          description: "desc",
          raw_text: "raw"
        }
      ]
    };

    expect(payload.jobs[0].job_id).toBe("1");
  });
});
