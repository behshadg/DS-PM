// app/dashboard/tenants/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Tenant } from "@prisma/client"
import Link from "next/link"
import { Button } from "components/ui/button"

export type TenantColumn = {
  id: string
  name: string
  email: string
  phone: string
  property: string | null
}

export const columns: ColumnDef<TenantColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "property",
    header: "Property",
    cell: ({ row }) => row.getValue("property") || "Unassigned",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/dashboard/tenants/${row.original.id}`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
]