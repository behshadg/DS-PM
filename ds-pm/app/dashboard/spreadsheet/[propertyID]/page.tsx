import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import ExpenseSpreadsheet from "components/ExpenseSpreadsheet";

const CUID_REGEX = /^c[^\s-]{8,}$/i;

export default async function PropertySpreadsheetPage(
  props: {
    params: Promise<{ propertyId: string }>;
  }
) {
  const params = await props.params;
  const propertyId = params?.propertyId;

  if (!propertyId || !CUID_REGEX.test(propertyId)) {
    return notFound();
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  try {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: user.id },
      select: { id: true, title: true }
    });

    if (!property) return notFound();

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Spreadsheet for {property.title}
        </h1>
        <ExpenseSpreadsheet propertyId={property.id} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}