import { getCurrentUser } from "@/lib/domainUser";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { PropertyDetails } from "components/property-details";
import { Button } from "components/ui/button";
import Link from "next/link";

export default async function PropertyPage(
  props: { 
    params: Promise<{ id: string }> 
  }
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const property = await prisma.property.findUnique({
    where: { id: params.id, ownerId: user.id },
    include: {
      documents: true,
      tenants: true,
      images: true
    }
  });

  if (!property) redirect("/dashboard");

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{property.title}</h1>
        <Link href="/dashboard/properties">
          <Button variant="outline">Back to Properties</Button>
        </Link>
      </div>
      
      <PropertyDetails 
        property={{
          ...property,
          images: property.images,
          documents: property.documents,
          tenants: property.tenants
        }} 
      />
    </div>
  );
}