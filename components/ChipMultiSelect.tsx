"use client";

import { ToggleChip } from "@/components/primitives";

/** Özellik / tür gibi kısa listeler için çoklu seçim. */
export default function ChipMultiSelect<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  hint?: string;
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span className="text-slate-600 dark:text-slate-300">
        {label} {hint ? <span className="text-slate-400">({hint})</span> : null}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <ToggleChip
            key={o}
            selected={value.includes(o)}
            onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}
          >
            {o}
          </ToggleChip>
        ))}
      </div>
    </div>
  );
}
