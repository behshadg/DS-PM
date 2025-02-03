import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import EditPropertyForm from "components/EditPropertyForm";
interface PageProps {
  params: { id: string };
}

export default async function EditPropertyPage({ params }: PageProps) {

  if (!params || !params.id) {
    return notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const property = await prisma.property.findFirst({
    where: { id: params.id, ownerId: user.id },
  });

  if (!property) {
    return notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <EditPropertyForm initialData={JSON.parse(JSON.stringify(property))} />
    </div>
  );
}
