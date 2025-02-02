// app/dashboard/page.tsx
import DashboardContent from "components/DashboardContent";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <DashboardContent user={user} />;
}