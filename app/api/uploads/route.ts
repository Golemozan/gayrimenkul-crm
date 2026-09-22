import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";
import { DEMO } from "@/lib/demo";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await currentUser()))
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  if (DEMO)
    return NextResponse.json({ error: "Demoda fotoğraf yükleme kapalı" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "Dosya yok" }, { status: 400 });

  try {
    return NextResponse.json({ url: await saveUpload(file) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
