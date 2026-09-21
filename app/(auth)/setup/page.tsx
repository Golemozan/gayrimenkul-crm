import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Card } from "@/components/primitives";
import { setupAction } from "@/app/actions/auth";
import { hasUsers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  if (hasUsers()) redirect("/login");

  return (
    <Card className="p-6">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">İlk kurulum</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
        Yönetici hesabını oluşturun. Bu ekran yalnızca bir kez görünür.
      </p>
      <AuthForm
        action={setupAction}
        submitLabel="Hesabı oluştur"
        fields={[
          { name: "username", label: "Kullanıcı adı", autoComplete: "username" },
          { name: "password", label: "Şifre (en az 8 karakter)", type: "password", autoComplete: "new-password" },
          { name: "password2", label: "Şifre (tekrar)", type: "password", autoComplete: "new-password" },
        ]}
      />
    </Card>
  );
}
