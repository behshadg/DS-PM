// app/dashboard/tenants/columns.tsx
"use client"; // Add this at the top

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "components/ui/button"
import { TenantWithProperty } from "@/types"

export const columns: ColumnDef<TenantWithProperty>[] = [
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
    cell: ({ row }) => {
      const property = row.original.property;
      return property ? `${property.address}, ${property.city}` : "Unassigned";
    },
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