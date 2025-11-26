"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";

export function ClientButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Button size="lg" className="ml-4 px-8 py-4 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg rounded-lg">
        {children}
      </Button>
    </Link>
  );
}
