import { ReactNode } from "react";

interface InfoProps {
  label: string;
  value: ReactNode;
}

export function Info({ label, value }: InfoProps) {
  return (
    <div className="flex flex-col mb-2">
      <span className="text-xs text-slate-500 font-semibold">{label}</span>
      <span className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{value}</span>
    </div>
  );
}
