// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  items?: EachRoute[];
};

export const ROUTES: EachRoute[] = [
  {
    title: "Bắt Đầu",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Giới Thiệu", href: "/introduction" },
      { title: "Cài Đặt", href: "/installation" },
      { title: "Kiến Trúc", href: "/architecture" },
      { title: "Hướng Dẫn Sử Dụng Nhanh", href: "/quick-start-guide" },
    ],
  },
  {
    title: "Tính Năng",
    href: "/key-features",
    noLink: true,
    items: [
      {
        title: "Giao Dịch - Trading",
        href: "/trading",
        items: [{ title: "Cấu Trúc", href: "/model" }],
      },

      { title: "Báo Giá - Quote", href: "/quote" },
      { title: "Niêm Yết - Listing", href: "/listing" },
      { title: "Tài Chính - Financials", href: "/financials" },
    ],
  },
];

type Page = { title: string; href: string };

function getRecurrsiveAllLinks(node: EachRoute) {
  const ans: Page[] = [];
  if (!node.noLink) {
    ans.push({ title: node.title, href: node.href });
  }
  node.items?.forEach((subNode) => {
    const temp = { ...subNode, href: `${node.href}${subNode.href}` };
    ans.push(...getRecurrsiveAllLinks(temp));
  });
  return ans;
}

export const page_routes = ROUTES.map((it) => getRecurrsiveAllLinks(it)).flat();
