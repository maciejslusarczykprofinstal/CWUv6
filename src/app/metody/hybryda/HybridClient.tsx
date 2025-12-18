"use client";
import dynamic from "next/dynamic";

const CwuHybridSimulation = dynamic(() => import("../CwuHybridSimulation"), { ssr: false });

export default function HybridClient() {
  return <CwuHybridSimulation />;
}
