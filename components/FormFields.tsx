"use client";

const fieldCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-light";
const labelCls = "text-slate-600 dark:text-slate-300";

export function Input({
  label,
  className,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className={labelCls}>{label}</span>
      <input {...rest} className={fieldCls} />
    </label>
  );
}

export function Textarea({
  label,
  className,
  ...rest
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className={labelCls}>{label}</span>
      <textarea {...rest} rows={3} className={fieldCls} />
    </label>
  );
}

export function Select({
  label,
  options,
  className,
  placeholder,
  ...rest
}: {
  label: string;
  options: { value: string; label: string }[] | string[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className={labelCls}>{label}</span>
      <select {...rest} className={`${fieldCls} capitalize`}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
