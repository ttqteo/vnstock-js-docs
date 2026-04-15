"use client";

import dynamic from "next/dynamic";

const SheetLeftbar = dynamic(
  () => import("./leftbar").then((mod) => mod.SheetLeftbar),
  { ssr: false },
);

export function MobileMenu() {
  return <SheetLeftbar />;
}
