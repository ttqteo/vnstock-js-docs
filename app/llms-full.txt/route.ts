import { docMarkdown, listDocs, RULES, SUMMARY } from "@/lib/llms";

export const dynamic = "force-static";

export async function GET() {
  const docs = await listDocs();
  const pages = await Promise.all(docs.map((d) => docMarkdown(d.slug)));
  const body = [`# vnstock-js\n\n> ${SUMMARY}\n\nQuy tắc quan trọng:\n\n${RULES}\n`, ...pages.filter(Boolean)].join("\n---\n\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
