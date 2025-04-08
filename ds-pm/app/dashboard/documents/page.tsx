import { getCurrentUser } from "@/lib/domainUser";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { FileIcon } from "lucide-react";
import { Button } from "components/ui/button";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    include: { documents: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="p-14 text-2xl font-bold">Property Documents</h1>
        <Button asChild>
          <Link href="/dashboard/properties">Back to Properties</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {properties.map((property) => (
          <div key={property.id} className="border rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-2">{property.title}</h2>
            <div className="grid grid-cols-1 gap-2">
              {property.documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <Link
                    href={document.url}
                    target="_blank"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <FileIcon className="h-4 w-4" />
                    <span className="text-sm">{document.name}</span>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {document.type}
                  </span>
                </div>
              ))}
              {property.documents.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No documents found for this property
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}