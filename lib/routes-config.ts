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
      { title: "Cài Đặt", href: "/installation" },
      { title: "Hướng Dẫn Sử Dụng Nhanh", href: "/quick-start-guide" },
      { title: "Quy Ước & Đơn Vị", href: "/conventions", since: "2.0" },
      { title: "Kiến Trúc", href: "/architecture" },
      { title: "Danh Sách Hàm", href: "/api-references" },
      { title: "Nâng Cấp Từ v1", href: "/migration", since: "2.0" },
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
        items: [
          { title: "Bảng Giá - Prices", href: "/trading" },
          { title: "Lịch Sử Giá - History", href: "/quote" },
          { title: "Danh Mục Mã - Symbols", href: "/listing" },
          { title: "Tìm Kiếm - Search", href: "/search" },
          { title: "Tài Chính - Financials", href: "/financials" },
          { title: "Thị Trường - Market", href: "/market", since: "1.5" },
          { title: "Sàng Lọc - Screening", href: "/screening" },
          { title: "Chỉ Báo & Pattern", href: "/indicators" },
          { title: "AI Context", href: "/ai-context", since: "1.4" },
          { title: "Danh Mục Đầu Tư", href: "/portfolio", since: "2.0" },
          { title: "Theo Dõi & Cảnh Báo", href: "/realtime", since: "2.0" },
          { title: "Backtest & Phiên Tương Tự", href: "/backtest", since: "2.0" },
          { title: "Trình Duyệt & Proxy", href: "/proxy", since: "2.0" },
          { title: "Lịch Giao Dịch - Calendar", href: "/calendar" },
          { title: "Vàng, Tỷ Giá, Tin Tức", href: "/commodity" },
          { title: "MCP Server", href: "/mcp", since: "1.4" },
          { title: "Watchlist", href: "/watchlist", since: "1.4" },
        ],
      },
    ],
  },
  {
    title: "Dữ Liệu",
    href: "/data",
    noLink: true,
    items: [
      { title: "Bar", href: "/ChartData" },
      { title: "Quote", href: "/PriceBoardItem" },
      { title: "Tick", href: "/RealtimeQuote" },
      { title: "TopMover", href: "/TopStock" },
      { title: "CompanyProfile", href: "/CompanyProfile" },
      { title: "ScreenRow", href: "/ScreenResult" },
      { title: "GoldQuote & FxRate", href: "/ExchangeRate" },
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
