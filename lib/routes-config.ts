// for page navigation & to sort on leftbar

export type EachRoute = {
  title: string;
  href: string;
  noLink?: true; // noLink will create a route segment (section) but cannot be navigated
  since?: string; // version đầu tiên có feature này (vd "1.4")
  releasedAt?: string; // ngày release "YYYY-MM-DD", badge "Mới" tự hiện trong NEW_BADGE_DAYS ngày
  items?: EachRoute[];
};

// Số ngày sau release còn hiện badge "Mới". Sau đó chỉ giữ badge version.
export const NEW_BADGE_DAYS = 90;

export const ROUTES: EachRoute[] = [
  {
    title: "Bắt Đầu",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "Giới Thiệu", href: "/introduction" },
      { title: "Danh Sách Hàm", href: "/api-references" },
      { title: "Cài Đặt", href: "/installation" },
      { title: "Kiến Trúc", href: "/architecture" },
      { title: "Hướng Dẫn Sử Dụng Nhanh", href: "/quick-start-guide" },
      { title: "CLI", href: "/cli" },
      { title: "Lịch Sử Phiên Bản", href: "/changelog" },
      { title: "Câu Hỏi Thường Gặp", href: "/faq" },
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
        releasedAt: "2026-05-22",
        items: [
          {
            title: "Giao Dịch - Trading",
            href: "/trading",
          },
          { title: "Báo Giá - Quote", href: "/quote" },
          { title: "Niêm Yết - Listing", href: "/listing" },
          { title: "Tài Chính - Financials", href: "/financials" },
          { title: "Chỉ Báo - Indicators", href: "/indicators" },
          { title: "AI Context", href: "/ai-context", since: "1.4", releasedAt: "2026-05-22" },
          { title: "Thị Trường - Market", href: "/market", since: "1.5", releasedAt: "2026-07-31" },
          { title: "MCP Server", href: "/mcp", since: "1.4", releasedAt: "2026-05-22" },
          { title: "Watchlist", href: "/watchlist", since: "1.4", releasedAt: "2026-05-22" },
          { title: "Sàng Lọc - Screening", href: "/screening" },
          { title: "Tìm Kiếm - Search", href: "/search" },
          { title: "Lịch Giao Dịch - Calendar", href: "/calendar" },
          { title: "Realtime - Thời Gian Thực", href: "/realtime" },
        ],
      },
    ],
  },
  {
    title: "Dữ Liệu",
    href: "/data",
    noLink: true,
    items: [
      { title: "QuoteHistory", href: "/ChartData" },
      { title: "PriceBoardItem", href: "/PriceBoardItem" },
      { title: "TopStock", href: "/TopStock" },
      { title: "CompanyProfile", href: "/CompanyProfile" },
      { title: "ScreenResult", href: "/ScreenResult" },
      { title: "RealtimeQuote", href: "/RealtimeQuote" },
      { title: "ExchangeRate", href: "/ExchangeRate" },
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
