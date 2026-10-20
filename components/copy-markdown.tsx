"use client";

import { CheckIcon, CopyIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button";

// Hands the page to a chat or an agent as Markdown.
export default function CopyMarkdown({ markdown, href }: { markdown: string; href: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="not-prose flex flex-wrap items-center gap-2">
      <Button variant="outline" size="xs" className="gap-1.5 text-xs" onClick={copy}>
        {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
        {copied ? "Đã copy" : "Copy Markdown"}
      </Button>
      <a href={href} target="_blank" rel="noopener" className={buttonVariants({ variant: "ghost", size: "xs", className: "gap-1.5 text-xs text-muted-foreground" })}>
        <FileTextIcon className="w-3 h-3" />
        Xem .md
      </a>
    </div>
  );
}
