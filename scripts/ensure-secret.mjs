// predev / prestart: .env.local'da SESSION_SECRET yoksa rastgele üretip ekler.
// Böylece hem Node tarafı hem Edge middleware aynı anahtarı okur ve emlakçının
// elle bir şey ayarlaması gerekmez.
import fs from "node:fs";
import { randomBytes } from "node:crypto";

const file = ".env.local";
const cur = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

if (process.env.SESSION_SECRET || /^SESSION_SECRET=.{32,}$/m.test(cur)) process.exit(0);

const line = `SESSION_SECRET=${randomBytes(32).toString("hex")}\n`;
fs.writeFileSync(file, cur && !cur.endsWith("\n") ? `${cur}\n${line}` : cur + line);
console.log("SESSION_SECRET üretildi ve .env.local'a yazıldı.");
