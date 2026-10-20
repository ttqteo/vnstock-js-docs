import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Kind = "lib" | "client" | "external" | "optional";

function Node({ title, sub, code, kind = "lib" }: { title: string; sub?: string; code?: string; kind?: Kind }) {
  return (
    <div className={cn("arch-node rounded-lg px-3.5 py-2.5", `arch-${kind}`)}>
      <div className="text-sm font-semibold leading-snug">{title}</div>
      {code && <div className="mt-1 font-code text-xs text-blue-600 dark:text-blue-400 break-words">{code}</div>}
      {sub && <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Arrow({ label, up = false }: { label?: string; up?: boolean }) {
  const Icon = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <div className="flex items-center justify-center gap-1.5 py-1 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label && <span className="text-[11px]">{label}</span>}
    </div>
  );
}

function Lane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="arch-lane rounded-xl p-2.5">
      <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Swatch({ kind, label }: { kind: Kind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("arch-node inline-block h-3 w-4 rounded", `arch-${kind}`)} />
      {label}
    </span>
  );
}

// The 2.x layers as theme-aware blocks; the order inside a lane is the direction a call travels.
export default function Architecture() {
  return (
    <figure className="arch not-prose my-6 rounded-xl p-3 sm:p-4">
      <div className="mx-auto max-w-md">
        <Node title="Ứng dụng của bạn" sub="Node · Bun · Deno · Workers · trình duyệt" />
        <Arrow />
        <Node
          kind="client"
          title="Client"
          code="vn · createClient({ proxy, storage, ... })"
          sub="stock() · index() · market() · screen() · portfolio() · watch()"
        />
        <Arrow />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Lane label="Dữ liệu">
          <Node title="Source VCI" sub="đổi dữ liệu VCI sang Bar, Quote (đồng)" />
          <Arrow />
          <Node title="Transport" sub="fetch · retry · rate limit · proxy" />
          <Arrow label="chỉ trên trình duyệt" />
          <Node kind="optional" title="vnstock-js/proxy" sub="chuyển tiếp theo danh sách đường dẫn cố định" />
          <Arrow />
          <Node kind="external" title="VietCap" sub="bảng giá · nến · công ty · tài chính" />
        </Lane>
        <div className="grid gap-3 content-start">
          <Lane label="Thời gian thực">
            <Node title="Realtime" sub="watch(): một WebSocket chung, hoặc poll" />
            <Arrow />
            <Node kind="external" title="SSI WebSocket" sub="giá khớp trực tiếp" />
          </Lane>
          <Lane label="Bộ nhớ đệm">
            <Node title="Storage" sub="memoryStorage · fileStorage" />
            <Arrow up label="tải lười, cache" />
            <Node kind="external" title="Dữ liệu trên GitHub" sub="mã · lịch nghỉ · tỷ số · khối ngoại" />
          </Lane>
          <Lane label="Tính toán">
            <Node title="Compute & indicators" sub="hàm thuần trên Bar[], không gọi mạng" />
          </Lane>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <Swatch kind="lib" label="trong thư viện" />
        <Swatch kind="external" label="nguồn bên ngoài" />
        <Swatch kind="optional" label="tuỳ chọn" />
      </figcaption>
    </figure>
  );
}
