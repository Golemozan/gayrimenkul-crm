"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button, Notice } from "@/components/primitives";
import { Input } from "@/components/FormFields";
import type { FormState } from "@/app/actions/auth";

type Field = { name: string; label: string; type?: string; autoComplete?: string };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Bekleyin…" : label}
    </Button>
  );
}

export default function AuthForm({
  action,
  fields,
  submitLabel,
  hidden,
  autoFocus = true,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  hidden?: Record<string, string>;
  autoFocus?: boolean;
}) {
  const [state, formAction] = useFormState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {Object.entries(hidden ?? {}).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {fields.map((f, i) => (
        <Input
          key={f.name}
          name={f.name}
          label={f.label}
          type={f.type ?? "text"}
          autoComplete={f.autoComplete}
          autoFocus={autoFocus && i === 0}
          required
        />
      ))}
      {state?.error ? <Notice>{state.error}</Notice> : null}
      {state?.ok ? <Notice tone="ok">{state.ok}</Notice> : null}
      <Submit label={submitLabel} />
    </form>
  );
}
