"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { EditClientForm } from "@/components/ClientForm";
import DeleteButton from "@/components/DeleteButton";
import { Button } from "@/components/primitives";
import type { Client } from "@/types";

type Option = { value: string; label: string };

export default function ClientHeaderActions({
  client,
  properties,
  children,
}: {
  client: Client;
  properties: Option[];
  children: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) return <EditClientForm client={client} properties={properties} onClose={() => setEditing(false)} />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <DeleteButton kind="client" id={client.id} redirectTo="/clients" label="Müşteriyi sil" confirmText={`"${client.full_name}" ve tüm talepleri, geçmişi silinsin mi?`} className="px-2" />
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
          Düzenle
        </Button>
      </div>
      {children}
    </div>
  );
}
