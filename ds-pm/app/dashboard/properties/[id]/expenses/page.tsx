// app/dashboard/properties/[id]/expenses/page.tsx
import ExpenseSpreadsheet from "components/ExpenseSpreadsheet";
import { getCurrentUser } from "@/lib/domainUser";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpensesPage(props: PageProps) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

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
