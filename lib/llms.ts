import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { page_routes } from "./routes-config";

export const SITE = "https://vnstock-js-docs.vercel.app";

export const SUMMARY =
  "vnstock-js là thư viện TypeScript lấy dữ liệu chứng khoán Việt Nam (giá, nến, bảng giá, công ty, tài chính, thị trường, khối ngoại, sàng lọc, chỉ báo, backtest, MCP). Tài liệu này dành cho bản 2.x.";

// The rules an LLM most often gets wrong because it learned vnstock-js 1.x.
export const RULES = `- Bản 2.x khác hẳn 1.x: \`import { vn } from "vnstock-js"\`, không có \`init()\`, không có default export, không có \`stock.quote()\`.
- Tiền luôn tính bằng đồng: giá \`127000\` là 127.000 đồng. Không nhân hay chia 1000.
- Chỉ số là điểm. \`changePct\` là phần trăm (\`0.95\` là 0,95%). Tỷ số tài chính là phân số (\`roe: 0.15\` là 15%).
- Nến có \`time\` theo giờ Việt Nam, không có \`date\`. Range: \`1d 5d 1mo 3mo 6mo ytd 1y 2y 5y max\` (không có \`6m\`).
- Tham số luôn là \`symbol\`, không phải \`ticker\`.
- Chỉ báo import từ \`vnstock-js/indicators\`, nhận \`Bar[]\`, không gọi mạng.
- Trình duyệt phải đi qua proxy: \`nextHandler()\` từ \`vnstock-js/proxy\` và \`createClient({ proxy: "/api/vnstock" })\`.
- Lỗi có \`code\` và \`hint\`; hiển thị \`hint\` cho người dùng.`;

export type DocEntry = { slug: string; title: string; description: string };

function contentPath(slug: string) {
  return path.join(process.cwd(), "contents/docs", slug, "index.mdx");
}

const ARCHITECTURE_MD = `Kiến trúc (theo chiều một lời gọi đi):

- Ứng dụng của bạn (Node, Bun, Deno, Workers, trình duyệt) gọi Client: \`vn\` hoặc \`createClient({ proxy, storage, ... })\`.
- Dữ liệu: Source VCI đổi dữ liệu VietCap sang \`Bar\`, \`Quote\` (đồng) → Transport (fetch, retry, rate limit, proxy) → \`vnstock-js/proxy\` (chỉ trên trình duyệt) → VietCap.
- Thời gian thực: Realtime (\`watch()\`, một WebSocket chung hoặc poll) → SSI WebSocket.
- Bộ nhớ đệm: Storage (\`memoryStorage\`, \`fileStorage\`) tải lười từ dữ liệu trên GitHub (mã, lịch nghỉ, tỷ số, khối ngoại).
- Tính toán: compute và indicators là hàm thuần trên \`Bar[]\`, không gọi mạng.`;

/** MDX body to plain Markdown: components become text an LLM can read. */
function toMarkdown(body: string): string {
  return body
    .replace(/<Architecture\s*\/>/g, ARCHITECTURE_MD)
    .replace(/<img\s+[^>]*?src="([^"]+)"[^>]*?alt="([^"]*)"[^>]*\/>/g, "![$2]($1)")
    .replace(/<Note(?:\s+[^>]*?title="([^"]*)")?[^>]*>([\s\S]*?)<\/Note>/g, (_m, title: string | undefined, inner: string) => {
      const lines = inner.trim().split("\n");
      const head = title ? `**${title}:** ` : "**Lưu ý:** ";
      return lines.map((l, i) => "> " + (i === 0 ? head : "") + l).join("\n");
    })
    .trim();
}

export async function docMarkdown(slug: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(contentPath(slug), "utf-8");
    const { data, content } = matter(raw);
    const head = `# ${data.title}\n\n${data.description ? `> ${data.description}\n\n` : ""}`;
    return head + toMarkdown(content) + "\n";
  } catch {
    return null;
  }
}

export async function listDocs(): Promise<DocEntry[]> {
  const out: DocEntry[] = [];
  for (const r of page_routes) {
    const slug = r.href.replace(/^\//, "");
    try {
      const { data } = matter(await fs.readFile(contentPath(slug), "utf-8"));
      out.push({ slug, title: data.title ?? r.title, description: data.description ?? "" });
    } catch {
      // a section without its own page
    }
  }
  return out;
}
