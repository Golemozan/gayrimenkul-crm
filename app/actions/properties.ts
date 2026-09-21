"use server";

import { run } from "@/lib/action";
import { propertySchema } from "@/lib/schemas";
import {
  deleteProperty as dbDelete,
  getProperty,
  insertProperty,
  updateProperty,
} from "@/lib/db/properties";
import { runForProperty } from "@/lib/db/matches";
import { removeUploads } from "@/lib/uploads";

/** Kaydet + eşleştirme motorunu çalıştır. Yeni eşleşme sayısını döner. */
export async function saveProperty(id: string | null, raw: unknown) {
  return run(() => {
    const input = propertySchema.parse(raw);
    const data = { ...input, image_url: input.images[0] ?? null };
    let pid: string;
    if (id) {
      const before = getProperty(id);
      if (!before) throw new Error("İlan bulunamadı");
      updateProperty(id, data);
      removeUploads(before.images.filter((u) => !data.images.includes(u)));
      pid = id;
    } else {
      pid = insertProperty(data);
    }
    return { id: pid, newMatches: runForProperty(pid) };
  });
}

export async function deleteProperty(id: string) {
  return run(() => {
    const p = dbDelete(id);
    if (p) removeUploads(p.images);
    return null;
  });
}
