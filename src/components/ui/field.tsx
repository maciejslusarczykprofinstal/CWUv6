import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {hint && <div className="text-xs text-slate-500 mb-1">{hint}</div>}
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
