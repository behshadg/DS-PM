// app/dashboard/properties/columns.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PropertyWithTenants } from "@/types";

// Adjust your type if needed. For instance, if some properties might not have tenants,
// you can either make tenants optional or default them to an empty array.
export const columns: ColumnDef<PropertyWithTenants>[] = [
  {
    accessorKey: "title",
    header: "Title",
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
    cell: ({ row }) => {
      return <span>${row.original.price}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // For example, an edit button
      return (
        <button
          onClick={() => {
            // Handle edit action – make sure this function is defined inside this client module.
            console.log("Edit", row.original.id);
          }}
        >
          Edit
        </button>
      );
    },
  },
];
