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
      { title: "Danh Sách Hàm (*)", href: "/api-references" },
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
        title: "Cơ Bản",
        href: "/basic",
      },
      {
        title: "Nâng Cao",
        href: "/advanced",
        items: [
          {
            title: "Giao Dịch - Trading",
            href: "/trading",
          },
          { title: "Báo Giá - Quote", href: "/quote" },
          { title: "Niêm Yết - Listing", href: "/listing" },
          { title: "Tài Chính - Financials", href: "/financials" },
        ],
      },
    ],
  },
  {
    title: "Dữ Liệu",
    href: "/data",
    noLink: true,
    items: [
      {
        title: "ChartData",
        href: "/ChartData",
      },
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
