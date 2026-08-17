import { MANTRA_CONFIG } from "./config";
import { getLesson } from "./api";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Centrally preserves all active URL query parameters (service, upa_id, uid, locale, etc.)
 * when navigating to a new path or route.
 */
export const preserveQueryParams = (targetPath: string): string => {
  if (typeof window === "undefined" || !window.location) {
    return targetPath;
  }

  const [pathname, targetQuery] = targetPath.split("?");
  const currentParams = new URLSearchParams(window.location.search || "");

  // Normalize legacy 'source' param to 'service'
  if (currentParams.has("source")) {
    const val = currentParams.get("source");
    if (val && !currentParams.has("service")) {
      currentParams.set("service", val);
    }
    currentParams.delete("source");
  }

  if (targetQuery) {
    const targetParams = new URLSearchParams(targetQuery);
    targetParams.forEach((value, key) => {
      if (key === "source") {
        currentParams.set("service", value);
      } else {
        currentParams.set(key, value);
      }
    });
  }

  const mergedSearch = currentParams.toString();
  return mergedSearch ? `${pathname}?${mergedSearch}` : pathname;
};

/**
 * Centrally detects execution context and handles exit / back actions across all 3 contexts:
 * 1. React Native WebView -> window.ReactNativeWebView.postMessage({ action: "exit" })
 * 2. iframe inside provider.mantracare.com -> window.parent.postMessage({ action: "exit" }, "https://provider.mantracare.com")
 * 3. Standalone browser -> window.location.href = "https://provider.mantracare.com"
 */
export function handleExit() {
  if (typeof window === "undefined") return;

  // 1. React Native WebView
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ action: "exit" })
    );
    return;
  }

  // 2. iframe inside provider.mantracare.com
  if (window.parent !== window) {
    window.parent.postMessage(
      { action: "exit" },
      "https://provider.mantracare.com"
    );
    return;
  }

  // 3. Standalone browser
  window.location.href = "https://provider.mantracare.com";
}

/**
 * Navigates to a specific screen inside the native React Native app (e.g. after task completion)
 */
export function navigateToNativeScreen(
  screen: string = "Home",
  params: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        action: "navigate",
        screen,
        params,
      })
    );
  }
}

/**
 * Navigates to the Clients page across all 3 contexts:
 * 1. React Native WebView -> window.ReactNativeWebView.postMessage(JSON.stringify({ action: "navigate", params: { page: "/clients" } }))
 * 2. iframe inside provider.mantracare.com -> window.parent.postMessage({ action: "navigate", params: { page: "/clients" } }, "https://provider.mantracare.com")
 * 3. Standalone browser -> window.location.href = "https://provider.mantracare.com/clients"
 */
export function navigateToClientsPage() {
  if (typeof window === "undefined") return;

  // 1. React Native WebView
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        action: "navigate",
        params: { page: "/clients" }
      })
    );
    return;
  }

  // 2. iframe inside provider.mantracare.com
  if (window.parent !== window) {
    window.parent.postMessage(
      {
        action: "navigate",
        params: { page: "/clients" }
      },
      "https://provider.mantracare.com"
    );
    return;
  }

  // 3. Standalone browser
  window.location.href = "https://provider.mantracare.com/clients";
}

/**
 * Handles back routing, delegating to handleExit or onBackCallback.
 */
export const goBack = (onBackCallback?: () => void) => {
  if (onBackCallback) {
    onBackCallback();
  } else {
    handleExit();
  }
};

/**
 * Redirects back to Dashboard / Exit.
 */
export const goToDashboard = () => {
  handleExit();
};

/**
 * Navigates popstate router to the selected task route pathway within the app,
 * preserving query parameters.
 */
export const goToLesson = (route: string) => {
  if (typeof window === "undefined") return;

  const currentPathname = window.location.pathname;
  const subpathMatch = currentPathname.match(/^(\/[^\/]+)/);
  const currentSubpath =
    subpathMatch && subpathMatch[1] && !subpathMatch[1].startsWith("/task")
      ? subpathMatch[1]
      : "";

  const fullPath =
    route === "/"
      ? currentSubpath || "/"
      : (currentSubpath + route).replace("//", "/");
  const targetUrl = preserveQueryParams(fullPath);

  window.history.replaceState(null, "", targetUrl);
  window.dispatchEvent(new Event("popstate"));
};
