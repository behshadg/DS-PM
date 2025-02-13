"use client";

import { Button } from "components/ui/button";
import { deleteProperty } from "@/actions/properties"; // Fix import path
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteProperty({ propertyId }: { propertyId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        const result = await deleteProperty(propertyId);
        if (!result.success) throw new Error(result.error);
        
        toast.success("Property deleted successfully");
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete property";
        toast.error(message);
      }
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}