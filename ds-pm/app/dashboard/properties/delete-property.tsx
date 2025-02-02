// app/dashboard/properties/delete-property.tsx
"use client";

import { Button } from "components/ui/button";
import { deleteProperty } from "@/actions/properties";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteProperty({ propertyId }: { propertyId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(propertyId);
        toast.success("Property deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}