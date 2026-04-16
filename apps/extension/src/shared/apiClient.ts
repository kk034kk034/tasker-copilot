import type {
  AnalyzeJobsRequest,
  AnalyzeJobsResponse,
  GenerateProposalRequest,
  GenerateProposalResponse,
  UserProfile
} from "@tasker-copilot/shared";

const API_BASE = "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${path} failed (${response.status}): ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  health: (): Promise<{ status: string }> => request("/health"),
  getCurrentProfile: (): Promise<UserProfile> => request("/profiles/current"),
  putCurrentProfile: (payload: UserProfile): Promise<UserProfile> =>
    request("/profiles/current", { method: "PUT", body: JSON.stringify(payload) }),
  scoreJobs: (payload: AnalyzeJobsRequest): Promise<AnalyzeJobsResponse> =>
    request("/jobs/score", { method: "POST", body: JSON.stringify(payload) }),
  generateProposal: (payload: GenerateProposalRequest): Promise<GenerateProposalResponse> =>
    request("/proposals/generate", { method: "POST", body: JSON.stringify(payload) })
};
