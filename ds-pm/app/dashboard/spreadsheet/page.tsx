// app/dashboard/spreadsheet/page.tsx
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SpreadsheetDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch all properties belonging to the current user.
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true, city: true, state: true },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Spreadsheet Dashboard</h1>
      {properties.length === 0 ? (
        <p>You have no properties. Please add one first.</p>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li
              key={property.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{property.title}</h2>
                <p>
                  {property.city}, {property.state}
                </p>
              </div>
              <Link href={`/dashboard/spreadsheet/${property.id}`}>
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  Open Spreadsheet
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
