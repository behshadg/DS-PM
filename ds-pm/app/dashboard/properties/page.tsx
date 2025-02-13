// app/dashboard/properties/page.tsx
import { DataTable } from "components/data-table";
import { columns } from "./columns";
import { Button } from "components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/domainUser";
import prisma from "@/lib/db";

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    include: { tenants: true }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Properties</h1>
        <Link href="/dashboard/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={properties} />
    </div>
  );
}
