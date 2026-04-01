# vnstock-js-docs

Trang tài liệu và ví dụ cho [vnstock-js](https://www.npmjs.com/package/vnstock-js).

[Live](https://vnstock-js-docs.vercel.app/) | [vnstock-js npm](https://www.npmjs.com/package/vnstock-js) | [vnstock-js GitHub](https://github.com/ttqteo/vnstock-js)

## Nội dung

- **Tài liệu** -- API reference, hướng dẫn, kiến trúc
- **Ví dụ** -- Widget: giá vàng, chỉ số, realtime, sàng lọc, chỉ báo kỹ thuật
- **Chi tiết cổ phiếu** -- `/stock/[symbol]` với biểu đồ TradingView, thông tin công ty, tài chính
- **Tin tức** -- Feed tin tức tài chính từ [news-crawler](https://github.com/ttqteo/news-crawler)

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- Tailwind CSS + shadcn/ui
- MDX
- TradingView Lightweight Charts
- vnstock-js

## Phát triển

```bash
pnpm install
pnpm dev
```

## Cấu trúc

```
app/
  docs/          # Trang tài liệu (MDX)
  examples/      # Ví dụ widget
  stock/[symbol] # Chi tiết cổ phiếu
  blog/          # Bài viết
components/
  stock-widget/  # Widget chứng khoán (copy-friendly)
  ui/            # shadcn/ui components
contents/
  docs/          # Nội dung MDX
  blogs/         # Bài viết MDX
```

## Giấy phép

[Apache 2.0](LICENSE) -- [ttqteo](https://github.com/ttqteo)
