"use client";

import { CheckIcon, LoaderIcon, WrenchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatTurn } from "@/lib/agent-demo";

// Steps of one turn: 0 question, 1 calling tools, 2 tools done, then one step per answer line.
const QUESTION_MS = 450;
const TOOL_MS = 900;
const LINE_MS = 380;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AgentChat({ turns }: { turns: ChatTurn[] }) {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const turn = turns[active];
  const lastStep = 2 + turn.answer.length + (turn.table ? 1 : 0);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (prefersReducedMotion()) {
      setStep(lastStep);
      return;
    }
    setStep(0);
    let at = QUESTION_MS;
    timers.current.push(setTimeout(() => setStep(1), at));
    at += TOOL_MS;
    timers.current.push(setTimeout(() => setStep(2), at));
    for (let s = 3; s <= lastStep; s++) {
      at += LINE_MS;
      timers.current.push(setTimeout(() => setStep(s), at));
    }
    return () => timers.current.forEach(clearTimeout);
  }, [active, lastStep]);

  const shownLines = Math.max(0, step - 2);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Thử hỏi:</span>
        {turns.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={cn(
              "px-3 py-1 text-xs rounded-full ring-1 ring-inset transition-colors",
              i === active ? "bg-foreground text-background ring-foreground" : "ring-foreground/20 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.chip}
          </button>
        ))}
      </div>

      <div className="overflow-hidden bg-[#141516] text-[#e5e2e1] rounded-sm">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
          <span className="text-xs text-white/40 font-mono ml-2">AI agent · vnstock-js MCP</span>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-6 min-h-[380px] text-sm leading-relaxed" aria-live="polite">
          <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm bg-white/10 px-4 py-2.5">{turn.question}</div>

          {step >= 1 && (
            <div className="flex flex-col gap-1.5">
              {turn.tools.map((t) => (
                <div key={t.name} className="flex items-start gap-2 font-mono text-xs text-white/55">
                  <WrenchIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span className="break-all">
                    <span className="text-sky-300">{t.name}</span>
                    {t.args}
                  </span>
                  {step >= 2 ? (
                    <CheckIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <LoaderIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          )}

          {shownLines > 0 && (
            <div className="flex flex-col gap-2 text-white/85">
              {turn.answer.slice(0, shownLines).map((line, i) => (
                <p key={i} className="animate-in fade-in duration-300">
                  {line}
                </p>
              ))}
              {turn.table && shownLines > turn.answer.length && (
                <div className="overflow-x-auto animate-in fade-in duration-300">
                  <table className="w-full font-mono text-xs">
                    <thead>
                      <tr className="text-white/45 text-left">
                        {turn.table.head.map((h) => (
                          <th key={h} className="py-1.5 pr-4 font-normal">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {turn.table.rows.map((r) => (
                        <tr key={r[0]} className="border-t border-white/10">
                          {r.map((c, i) => (
                            <td key={i} className={cn("py-1.5 pr-4", i === 0 && "text-white font-semibold")}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {turn.note && step >= lastStep && <p className="text-xs text-white/40">{turn.note}</p>}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Số liệu thật lấy bằng vnstock-js, làm mới mỗi giờ. Câu trả lời là mẫu dựng sẵn để minh hoạ cách agent gọi công cụ MCP, không phải một mô hình AI đang chạy.
      </p>
    </div>
  );
}
