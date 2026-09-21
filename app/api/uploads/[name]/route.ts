import fs from "node:fs";
import { currentUser } from "@/lib/auth";
import { MIME, uploadFile } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { name: string } }) {
  if (!(await currentUser())) return new Response("Yetkisiz", { status: 401 });

  const file = uploadFile(params.name);
  if (!file || !fs.existsSync(file)) return new Response("Bulunamadı", { status: 404 });

  const ext = params.name.split(".").pop()!;
  return new Response(fs.readFileSync(file), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      // Dosya adı UUID: içerik asla değişmez.
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
