// app/dashboard/spreadsheet/[propertyId]/page.tsx
import ExpenseSpreadsheet from "components/ExpenseSpreadsheetAG";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: { propertyId: string };
}

export default async function PropertySpreadsheetPage({ params }: PageProps) {
  // Await params if necessary (depending on your Next.js version)
  const resolvedParams = await params;
  const propertyId = resolvedParams.propertyId;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Verify the property belongs to the current user.
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: user.id },
  });
  if (!property) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Expense Spreadsheet for {property.title}
      </h1>
      <ExpenseSpreadsheet propertyId={property.id} />
    </div>
  );
}
