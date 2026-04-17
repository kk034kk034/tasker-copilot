import type {
  AnalyzeJobsRequest,
  AnalyzeJobsResponse,
  GenerateProposalRequest,
  GenerateProposalResponse,
  UserProfile
} from "@tasker-copilot/shared";

type RuntimeConfig = {
  apiBaseUrl: string;
  apiKey: string;
};

const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_PROD_API_BASE_URL = "https://api.your-domain.com";

function isDevBuild(): boolean {
  return chrome.runtime.getManifest().version_name === "dev";
}

async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const defaults: RuntimeConfig = {
    apiBaseUrl: isDevBuild() ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL,
    apiKey: ""
  };
  const loaded = (await chrome.storage.local.get(["apiBaseUrl", "apiKey"])) as Partial<RuntimeConfig>;

  return {
    apiBaseUrl: loaded.apiBaseUrl?.trim() || defaults.apiBaseUrl,
    apiKey: loaded.apiKey?.trim() || defaults.apiKey
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const runtimeConfig = await getRuntimeConfig();
  const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(runtimeConfig.apiKey ? { "X-API-Key": runtimeConfig.apiKey } : {}),
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
