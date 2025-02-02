// app/dashboard/tenants/page.tsx
import { DataTable } from "components/data-table"
import { columns } from "./columns"
import { Button } from "components/ui/button"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
export default async function TenantsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const tenants = await prisma.tenant.findMany({
    where: { ownerId: user.id },
    include: { property: true }
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Tenants</h1>
        <Link href="/dashboard/tenants/new">
          <Button>Add Tenant</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={tenants} />
    </div>
  )
}