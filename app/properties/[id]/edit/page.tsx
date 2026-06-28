import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EditPropertyForm from "@/components/EditPropertyForm";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();
  const property = data as Property;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Portföy" title="İlanı Düzenle" />
      <Link
        href="/properties"
        className="inline-block text-sm font-medium text-brand hover:underline dark:text-brand-light"
      >
        ← İlanlara dön
      </Link>
      <EditPropertyForm property={property} />
    </div>
  );
}
