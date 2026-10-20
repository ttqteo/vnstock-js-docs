import { docMarkdown } from "@/lib/llms";
import { page_routes } from "@/lib/routes-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return page_routes.map((r) => {
    const parts = r.href.split("/").slice(1);
    parts[parts.length - 1] += ".md";
    return { slug: parts };
  });
}

// /md/getting-started/introduction.md is the Markdown of /docs/getting-started/introduction.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const md = await docMarkdown(slug.join("/").replace(/\.md$/, ""));
  if (!md) return new Response("Not found", { status: 404 });
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
