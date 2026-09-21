import fs from "node:fs";
import { currentUser } from "@/lib/auth";
import { backupPath, snapshot } from "@/lib/backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/backup            → anlık yedek
// GET /api/backup?name=...   → kayıtlı günlük yedek
export async function GET(req: Request) {
  if (!(await currentUser())) return new Response("Yetkisiz", { status: 401 });

  const name = new URL(req.url).searchParams.get("name");
  let file: string | null;
  let tmp = false;
  if (name) {
    file = backupPath(name);
    if (!file || !fs.existsSync(file)) return new Response("Bulunamadı", { status: 404 });
  } else {
    file = await snapshot();
    tmp = true;
  }

  const buf = fs.readFileSync(file);
  if (tmp) fs.rmSync(file, { force: true });

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.sqlite3",
      "Content-Disposition": `attachment; filename="${name ?? `emlak-crm-${stamp}.db`}"`,
      "Cache-Control": "no-store",
    },
  });
}
