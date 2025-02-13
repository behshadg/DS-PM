// /app/dashboard/properties/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from '@/lib/domainUser';
import prisma from "@/lib/db";
import EditPropertyForm from "components/EditPropertyForm";

interface PageProps {
  params: { id: string }; // This is fine because `await`ing a plain object returns it.
}

export default async function EditPropertyPage({ params }: PageProps) {
  // Await the params (if they are a promise, this will resolve them;
  // if they’re already an object, this works fine)
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.id) {
    return notFound();
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const property = await prisma.property.findFirst({
    where: { id: resolvedParams.id, ownerId: user.id },
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
