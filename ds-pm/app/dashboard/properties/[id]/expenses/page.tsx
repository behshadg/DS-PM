// app/dashboard/properties/[id]/expenses/page.tsx

import ExpenseSpreadsheet from "components/ExpenseSpreadsheet";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpensesPage(props: PageProps) {
  const params = await props.params;
  // Get the currently logged in user
  const user = await getCurrentUser();
  if (!user) {
    // Optionally, redirect to login if user is not authenticated
    redirect("/login");
  }

  // Verify the property belongs to the user
  const property = await prisma.property.findFirst({
    where: { id: params.id, ownerId: user.id },
  });
  if (!property) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Expense Tracker for {property.title}
      </h1>
      <ExpenseSpreadsheet propertyId={property.id} />
    </div>
  );
}
