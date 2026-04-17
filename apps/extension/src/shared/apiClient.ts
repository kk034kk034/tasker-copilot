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
  anonymousToken: string;
};

const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_PROD_API_BASE_URL = "https://api.your-domain.com";

function isDevBuild(): boolean {
  return chrome.runtime.getManifest().version_name === "dev";
}

async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const devBuild = isDevBuild();
  const defaults: RuntimeConfig = {
    apiBaseUrl: devBuild ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL,
    apiKey: "",
    anonymousToken: ""
  };
  const loaded = (await chrome.storage.local.get([
    "apiBaseUrl",
    "apiKey",
    "anonymousToken",
    "anonymousTokenExpiresAt"
  ])) as Partial<RuntimeConfig> & { anonymousTokenExpiresAt?: number };
  const loadedApiBaseUrl = loaded.apiBaseUrl?.trim() || "";
  const resolvedApiBaseUrl =
    loadedApiBaseUrl && loadedApiBaseUrl !== DEFAULT_PROD_API_BASE_URL
      ? loadedApiBaseUrl
      : defaults.apiBaseUrl;
  const resolvedApiKey = loaded.apiKey?.trim() || defaults.apiKey;
  let resolvedAnonymousToken = "";

  if (!resolvedApiKey) {
    const now = Date.now();
    if (
      loaded.anonymousToken?.trim() &&
      typeof loaded.anonymousTokenExpiresAt === "number" &&
      loaded.anonymousTokenExpiresAt > now + 5000
    ) {
      resolvedAnonymousToken = loaded.anonymousToken.trim();
    } else {
      const authResponse = await fetch(`${resolvedApiBaseUrl}/auth/anonymous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!authResponse.ok) {
        throw new Error(`Failed to issue anonymous token (${authResponse.status})`);
      }
      const issued = (await authResponse.json()) as { token: string; expires_in: number };
      const expiresAt = now + Math.max(30, Number(issued.expires_in) || 3600) * 1000;
      resolvedAnonymousToken = issued.token;
      await chrome.storage.local.set({
        anonymousToken: issued.token,
        anonymousTokenExpiresAt: expiresAt
      });
    }
  }

  return {
    apiBaseUrl: resolvedApiBaseUrl,
    apiKey: resolvedApiKey,
    anonymousToken: resolvedAnonymousToken
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const runtimeConfig = await getRuntimeConfig();
  const response = await fetch(`${runtimeConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(runtimeConfig.apiKey ? { "X-API-Key": runtimeConfig.apiKey } : {}),
      ...(!runtimeConfig.apiKey && runtimeConfig.anonymousToken
        ? { Authorization: `Bearer ${runtimeConfig.anonymousToken}` }
        : {}),
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
