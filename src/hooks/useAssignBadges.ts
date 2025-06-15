
import { useAuthStatus } from "./useAuthStatus";

export async function useAssignBadges() {
  const { user } = useAuthStatus();
  const userId = user?.id;
  if (!userId) return;

  await fetch("https://tdqdeddshvjlqmefxwzj.functions.supabase.co/assign_badges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Optionally pass auth token if available.
      // "Authorization": "Bearer " + (await getSessionOrToken()),
    },
    body: JSON.stringify({ user_id: userId }),
  });
}
