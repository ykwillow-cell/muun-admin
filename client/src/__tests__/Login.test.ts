import { describe, it, expect, vi } from "vitest";
import { getLoginUrl } from "@/const";

describe("Login Functionality", () => {
  it("should generate valid login URL with correct parameters", () => {
    // Mock environment variables
    vi.stubGlobal("import", {
      meta: {
        env: {
          VITE_OAUTH_PORTAL_URL: "https://oauth.manus.im",
          VITE_APP_ID: "test-app-id",
        },
      },
    });

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://localhost:3000",
      },
      writable: true,
    });

    const loginUrl = getLoginUrl();

    expect(loginUrl).toBeDefined();
    expect(loginUrl).toContain("https://oauth.manus.im/app-auth");
    expect(loginUrl).toContain("appId=test-app-id");
    expect(loginUrl).toContain("redirectUri=https%3A%2F%2Flocalhost%3A3000%2Fapi%2Foauth%2Fcallback");
    expect(loginUrl).toContain("type=signIn");
  });

  it("should include state parameter in login URL", () => {
    vi.stubGlobal("import", {
      meta: {
        env: {
          VITE_OAUTH_PORTAL_URL: "https://oauth.manus.im",
          VITE_APP_ID: "test-app-id",
        },
      },
    });

    Object.defineProperty(window, "location", {
      value: {
        origin: "https://localhost:3000",
      },
      writable: true,
    });

    const loginUrl = getLoginUrl();
    const url = new URL(loginUrl);
    const state = url.searchParams.get("state");

    expect(state).toBeDefined();
    expect(state).toBeTruthy();
    // State should be base64 encoded redirect URI
    const decodedState = atob(state!);
    expect(decodedState).toBe("https://localhost:3000/api/oauth/callback");
  });
});
