import { listDocs, RULES, SITE, SUMMARY } from "@/lib/llms";

export const dynamic = "force-static";

export async function GET() {
  const docs = await listDocs();
  const body = [
    "# vnstock-js",
    "",
    `> ${SUMMARY}`,
    "",
    "Quy tắc quan trọng:",
    "",
    RULES,
    "",
    `Toàn bộ tài liệu trong một file: ${SITE}/llms-full.txt`,
    "",
    "## Tài liệu",
    "",
    ...docs.map((d) => `- [${d.title}](${SITE}/md/${d.slug}.md)${d.description ? `: ${d.description}` : ""}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
