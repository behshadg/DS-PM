// app/dashboard/properties/[id]/edit/page.tsx
import { getCurrentUser } from "@/lib/domainUser";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { PropertyForm } from "components/property-form";
export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.id, ownerId: user.id },
    include: {
      documents: true,
    },
  });

  if (!property) redirect("/dashboard/properties");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <PropertyForm
        property={{
          ...property,
          images: property.images || [],
          documents: property.documents.map(d => d.url) || [],
        }}
      />
    </div>
  );
}