"use client";

import { useRouter } from "next/navigation";
import PropertyFormCore from "@/components/PropertyFormCore";
import type { Property } from "@/types";

export default function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  return (
    <PropertyFormCore
      mode="edit"
      initial={property}
      onCancel={() => router.push("/properties")}
    />
  );
}
