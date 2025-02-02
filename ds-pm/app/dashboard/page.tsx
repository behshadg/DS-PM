// app/dashboard/page.tsx
import DashboardContent from "components/DashboardContent";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return <DashboardContent user={user} />;
}