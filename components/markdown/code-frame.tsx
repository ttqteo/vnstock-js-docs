"use client";

import { WrapTextIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Copy from "./copy";

const KEY = "code-wrap";
const EVENT = "code-wrap-change";

// Wrapped unless the reader turned it off.
function readWrap(): boolean {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

// One choice for every code block on the page, remembered per reader.
export default function CodeFrame({ raw, children }: { raw: string; children: ReactNode }) {
  const [wrap, setWrap] = useState(true);

  useEffect(() => {
    setWrap(readWrap());
    const onChange = (e: Event) => setWrap((e as CustomEvent<boolean>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  function toggle() {
    const next = !wrap;
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
    window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: next }));
  }

  return (
    <div className={cn("my-5 relative", wrap && "code-wrap")}>
      <div className="absolute top-3 right-2.5 z-10 flex gap-1.5">
        <Button
          variant="secondary"
          className={cn("border", wrap && "text-primary")}
          size="xs"
          onClick={toggle}
          aria-pressed={wrap}
          aria-label={wrap ? "Tắt xuống dòng" : "Xuống dòng"}
          title={wrap ? "Tắt xuống dòng" : "Xuống dòng"}
        >
          <WrapTextIcon className="w-3 h-3" />
        </Button>
        <div className="sm:block hidden">
          <Copy content={raw} />
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
