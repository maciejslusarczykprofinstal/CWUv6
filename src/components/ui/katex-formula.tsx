"use client";

import katex from "katex";
import { useMemo } from "react";

interface KatexFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexFormula({ formula, displayMode = false, className = "" }: KatexFormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        output: "html",
      });
    } catch (error) {
      console.error("KaTeX render error:", error);
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`katex-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
