"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Company {
  t: string; // ticker
  n: string; // name
  e: string; // exchange
}

let companiesCache: Company[] | null = null;

async function getCompanies(): Promise<Company[]> {
  if (companiesCache) return companiesCache;
  const res = await fetch("/companies.json");
  companiesCache = await res.json();
  return companiesCache!;
}

export function TickerSearch({
  onSelect,
  placeholder = "Tìm mã cổ phiếu...",
}: {
  onSelect: (ticker: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = input.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    const scored: { c: Company; s: number }[] = [];
    for (const c of companies) {
      const ticker = c.t.toLowerCase();
      const name = c.n.toLowerCase();
      let s = 0;
      if (ticker === q) s = 100;
      else if (ticker.startsWith(q)) s = 80;
      else if (name.startsWith(q)) s = 60;
      else if (ticker.includes(q) || name.includes(q)) s = 20;
      if (s > 0) scored.push({ c, s });
    }
    scored.sort((a, b) => b.s - a.s);
    setResults(scored.slice(0, 8).map((x) => x.c));
  }, [input, companies]);

  const handleSelect = (ticker: string) => {
    onSelect(ticker);
    setInput("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => input && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const q = input.toUpperCase().trim();
            if (q) handleSelect(q);
          }
        }}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden max-h-[300px] overflow-y-auto">
          {results.map((c) => (
            <button
              key={c.t}
              onClick={() => handleSelect(c.t)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold shrink-0">{c.t}</span>
                <span className="text-muted-foreground truncate">{c.n}</span>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs">
                {c.e}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
