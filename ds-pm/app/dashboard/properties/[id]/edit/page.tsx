import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import EditPropertyForm from "components/EditPropertyForm";

interface EditPropertyPageProps {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  if (!params || !params.id) {
    notFound();
  }

  // Get the current user (server-side function)
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch the property that belongs to the user
  const property = await prisma.property.findFirst({
    where: { id: params.id, ownerId: user.id },
  });

  if (!property) {
    notFound();
  }

  // Convert property data to plain JSON (to serialize dates, etc.)
  const serializableProperty = JSON.parse(JSON.stringify(property));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      {/* Pass the property data to a client component for editing */}
      <EditPropertyForm initialData={serializableProperty} />
    </div>
  );
}
