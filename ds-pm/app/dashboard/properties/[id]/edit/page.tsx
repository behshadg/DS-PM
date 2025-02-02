// app/dashboard/properties/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import EditPropertyForm from "components/EditPropertyForm";

export default async function EditPropertyPage({
  params
}: {
  params: { id: string }
}) {
  const propertyId = params?.id;
  if (!propertyId) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: user.id },
  });

  if (!property) notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <EditPropertyForm initialData={JSON.parse(JSON.stringify(property))} />
    </div>
  );
}