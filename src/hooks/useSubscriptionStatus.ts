
import { useState } from "react";

// This simple hook manages "subscribed" state locally. You can switch to server-driven logic later.
export function useSubscriptionStatus() {
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    // Check localStorage for "subscribed" status so it persists on reload
    return window.localStorage.getItem("kelp-subscribed") === "true";
  });

  function skipOrCompleteSubscription() {
    setSubscribed(true);
    window.localStorage.setItem("kelp-subscribed", "true");
  }

  function resetSubscription() {
    setSubscribed(false);
    window.localStorage.removeItem("kelp-subscribed");
  }

  return { subscribed, skipOrCompleteSubscription, resetSubscription };
}
