// components/PropertySelect.tsx
"use client";

import useSWR from "swr";

interface Property {
  id: string;
  title: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PropertySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function PropertySelect({ value, onChange }: PropertySelectProps) {
  const { data, error } = useSWR<Property[]>("/api/properties/my", fetcher);

  if (error) return <div>Error loading properties</div>;
  if (!data) return <div>Loading properties...</div>;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded border p-2"
    >
      <option value="">Select a property</option>
      {data.map((property) => (
        <option key={property.id} value={property.id}>
          {property.title}
        </option>
      ))}
    </select>
  );
}
