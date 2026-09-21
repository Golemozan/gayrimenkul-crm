import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EditPropertyForm from "@/components/EditPropertyForm";
import { getProperty } from "@/lib/db/properties";

export const dynamic = "force-dynamic";

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  const property = getProperty(params.id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Portföy" title="İlanı Düzenle" />
      <Link href={`/properties/${property.id}`} className="inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light">
        ← İlana dön
      </Link>
      <EditPropertyForm property={property} />
    </div>
  );
}
