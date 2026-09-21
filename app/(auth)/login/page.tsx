import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { Card } from "@/components/primitives";
import { loginAction } from "@/app/actions/auth";
import { currentUser, hasUsers } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  if (!hasUsers()) redirect("/setup");
  if (await currentUser()) redirect("/");

  return (
    <Card className="p-6">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Giriş yap</h1>
      <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">
        Portföy ve müşterilerinize erişmek için giriş yapın.
      </p>
      <AuthForm
        action={loginAction}
        submitLabel="Giriş yap"
        hidden={{ next: searchParams.next ?? "/" }}
        fields={[
          { name: "username", label: "Kullanıcı adı", autoComplete: "username" },
          { name: "password", label: "Şifre", type: "password", autoComplete: "current-password" },
        ]}
      />
    </Card>
  );
}
