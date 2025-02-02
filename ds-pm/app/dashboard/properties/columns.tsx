// app/dashboard/properties/columns.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PropertyWithTenants } from "@/types";
import Link from "next/link";
import { Button } from "components/ui/button";
import { DeleteProperty } from "./delete-property";
export const columns: ColumnDef<PropertyWithTenants>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link 
        href={`/dashboard/properties/${row.original.id}`}
        className="hover:underline"
      >
        {row.original.title}
      </Link>
    )
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <span>${row.original.price}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/dashboard/properties/${row.original.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <DeleteProperty propertyId={row.original.id} />
      </div>
    ),
  },
];