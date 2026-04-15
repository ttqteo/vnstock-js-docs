# Market Calendar & Academy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tạo trang Market Calendar (lịch sự kiện thị trường) + Academy (kiến thức đầu tư) tích hợp vào docs site hiện tại. Calendar hiển thị sự kiện sắp diễn ra, Academy giải thích kiến thức liên quan cho từng loại sự kiện.

**Architecture:** Thêm 1 section "Học Viện" mới trong sidebar docs với 5 bài academy + 1 trang Market Calendar interactive trong `/finance` hoặc route riêng `/calendar`. Academy là MDX content tĩnh. Calendar page là React component fetch events từ vnstock-js `company.events()`.

**Tech Stack:** Next.js 16 (App Router), MDX (next-mdx-remote), Lightweight Charts v5 (markers cho events trên chart), Tailwind CSS, shadcn/ui, vnstock-js

---

## Tổng quan các Task

| # | Task | Mô tả |
|---|------|-------|
| 1 | Academy MDX: Ex-date | Bài viết về ngày giao dịch không hưởng quyền |
| 2 | Academy MDX: Stock Split | Bài viết về chia tách cổ phiếu |
| 3 | Academy MDX: Dividend | Bài viết về cổ tức |
| 4 | Academy MDX: Shareholder Meeting | Bài viết về ĐHCĐ |
| 5 | Academy MDX: Rights Issue | Bài viết về phát hành thêm |
| 6 | Routes config | Thêm section "Học Viện" vào sidebar |
| 7 | Navbar update | Thêm link "Học Viện" vào navbar |
| 8 | Market Calendar page | Trang calendar interactive hiển thị sự kiện |
| 9 | Event markers on chart | Tích hợp markers sự kiện lên candlestick chart |

---

## Task 1: Academy MDX — Ngày Giao Dịch Không Hưởng Quyền (Ex-date)

**Files:**
- Create: `contents/docs/academy/ex-date/index.mdx`

**Step 1: Tạo file MDX**

```mdx
---
title: Ngay Giao Dich Khong Huong Quyen (Ex-date)
description: Tim hieu ve ngay giao dich khong huong quyen, anh huong den gia co phieu va quyen loi co dong
---

## Ngay giao dich khong huong quyen la gi?

**Ngay giao dich khong huong quyen (Ex-date)** la ngay ma nguoi mua co phieu se **khong** duoc huong quyen loi (co tuc, quyen mua, thuong co phieu) da duoc cong bo truoc do.

Neu ban mua co phieu **truoc** ngay Ex-date → ban duoc huong quyen.
Neu ban mua co phieu **tu ngay Ex-date tro di** → ban khong duoc huong quyen.

## Timeline su kien quyen

```
Ngay cong bo → Ngay dang ky cuoi cung → Ngay Ex-date → Ngay thanh toan
(Announcement)   (Record Date)           (Ex-date)      (Payment Date)
```

<Note>
Tai Viet Nam, ngay Ex-date thuong la **T+1** truoc ngay dang ky cuoi cung (do chu ky thanh toan T+2 cua VSD).
</Note>

## Anh huong den gia co phieu

Vao ngay Ex-date, gia tham chieu se duoc **dieu chinh giam** tuong ung voi gia tri quyen loi:

- **Co tuc tien mat 2,000 dong/cp**: gia tham chieu giam 2,000 dong
- **Co tuc co phieu 20%**: gia tham chieu = Gia dong cua / 1.2
- **Chia tach 2:1**: gia tham chieu = Gia dong cua / 2

## Vi du thuc te

| Su kien | Gia truoc Ex-date | Dieu chinh | Gia tham chieu moi |
|---------|-------------------|------------|---------------------|
| Co tuc 3,000d | 50,000 | -3,000 | 47,000 |
| Thuong CP 10% | 50,000 | /1.1 | 45,455 |
| Chia tach 5:1 | 100,000 | /5 | 20,000 |

## Lam sao de theo doi?

Su dung vnstock-js de lay danh sach su kien quyen cua cong ty:

```typescript
import { company } from "vnstock-js";

const events = await company.events({ ticker: "FPT" });
// Loc su kien co exDate
const exDateEvents = events.filter(e => e.exDate);
```

## Nhung dieu can luu y

1. **Mua truoc Ex-date it nhat 1 ngay** (T+2) de dam bao duoc ghi nhan quyen
2. Gia thuong **giam manh** vao ngay Ex-date — day la dieu chinh ky thuat, khong phai mat gia tri
3. Voi co phieu thanh khoan thap, gia co the mat nhieu ngay de hoi phuc ve muc cu
4. Kiem tra **ty le quyen** truoc khi quyet dinh — co tuc 500 dong/cp tren co phieu 100,000 chi la 0.5%
```

**Step 2: Commit**

```bash
git add contents/docs/academy/ex-date/index.mdx
git commit -m "docs: add academy article — ex-date (ngày không hưởng quyền)"
```

---

## Task 2: Academy MDX — Chia Tach Co Phieu (Stock Split)

**Files:**
- Create: `contents/docs/academy/stock-split/index.mdx`

**Step 1: Tạo file MDX**

```mdx
---
title: Chia Tach Co Phieu (Stock Split)
description: Co che chia tach co phieu, tac dong len gia va khoi luong giao dich
---

## Chia tach co phieu la gi?

**Chia tach co phieu (Stock Split)** la viec cong ty tang so luong co phieu dang luu hanh bang cach chia nho moi co phieu hien co thanh nhieu co phieu moi, **khong lam thay doi tong gia tri von hoa**.

Vi du: chia tach **5:1** nghia la moi 1 co phieu cu duoc tach thanh 5 co phieu moi.

## Truoc va sau chia tach

| | Truoc | Sau (5:1) |
|---|-------|-----------|
| So co phieu | 100 cp | 500 cp |
| Gia moi cp | 500,000d | 100,000d |
| Tong gia tri | 50,000,000d | 50,000,000d |

<Note>
Gia tri danh muc **khong thay doi**. Ban chi co nhieu co phieu hon voi gia thap hon.
</Note>

## Tai sao cong ty chia tach?

1. **Tang thanh khoan**: gia thap hon → nhieu nha dau tu nho co the mua
2. **Tam ly thi truong**: gia 20,000d "re" hon gia 100,000d (du cung 1 cong ty)
3. **Dat tieu chi niem yet**: mot so san yeu cau gia trong khoang nhat dinh
4. **Thu hut nha dau tu ca nhan**: lo giao dich nho hon, de tiep can hon

## Gop co phieu (Reverse Split)

Nguoc lai voi chia tach, **gop co phieu** giam so luong co phieu va tang gia tuong ung.

Vi du gop **1:5**: 500 co phieu gia 2,000d → 100 co phieu gia 10,000d.

Cong ty gop co phieu thuong de:
- Tranh bi huy niem yet (gia qua thap)
- Cai thien hinh anh co phieu

## Anh huong tren bieu do ky thuat

Sau chia tach, du lieu gia lich su can duoc **dieu chinh (adjusted)** de bieu do lien tuc:

```typescript
import { stock } from "vnstock-js";

// Du lieu da duoc dieu chinh tu dong
const data = await stock.quote({
  ticker: "VNM",
  start: "2024-01-01",
});
```

## Cac chia tach dang chu y tai Viet Nam

- **VNM**: chia tach nhieu lan, co phieu pho bien nhat san HOSE
- **FPT**: chia tach ket hop thuong co phieu
- **HPG**: chia tach de tang thanh khoan

## Luu y khi giao dich quanh ngay chia tach

1. **Khong co loi/lo thuc** tu ban than viec chia tach
2. Gia thuong **bien dong manh** truoc/sau ngay chia tach do tam ly
3. Kiem tra **ty le chia tach** chinh xac truoc khi dat lenh
4. Cac chi bao ky thuat (SMA, RSI) can duoc tinh lai tren gia adjusted
```

**Step 2: Commit**

```bash
git add contents/docs/academy/stock-split/index.mdx
git commit -m "docs: add academy article — stock split (chia tách cổ phiếu)"
```

---

## Task 3: Academy MDX — Co Tuc (Dividend)

**Files:**
- Create: `contents/docs/academy/dividend/index.mdx`

**Step 1: Tạo file MDX**

```mdx
---
title: Co Tuc (Dividend)
description: Cac hinh thuc tra co tuc, timeline tu cong bo den thanh toan, va cach tinh toan
---

## Co tuc la gi?

**Co tuc (Dividend)** la phan loi nhuan duoc cong ty phan phoi cho co dong. Day la mot trong hai cach nha dau tu kiem loi tu co phieu (cach con lai la chenh lech gia).

## Cac hinh thuc co tuc

### 1. Co tuc tien mat (Cash Dividend)

Tra truc tiep bang tien vao tai khoan chung khoan.

```
Vi du: co tuc 3,000 dong/co phieu
So huu 1,000 cp → Nhan 3,000,000 dong (truoc thue)
```

### 2. Co tuc co phieu (Stock Dividend)

Tra bang co phieu moi phat hanh them.

```
Vi du: co tuc 20% (ty le 5:1)
So huu 1,000 cp → Nhan them 200 cp moi
```

### 3. Co tuc bang tai san khac

Hiem gap tai Viet Nam. Tra bang tai san, san pham cua cong ty.

## Timeline co tuc

```
Ngay cong bo     Ngay DKCC      Ngay Ex-date    Ngay thanh toan
(Board approval)  (Record Date)  (T-1 truoc DKCC)  (Payment)
     |                |               |               |
     ▼                ▼               ▼               ▼
  Thong bao      So sach co dong   Gia dieu chinh   Tien/CP vao TK
  ty le co tuc   duoc chot         giam tuong ung
```

<Note>
Thue thu nhap ca nhan tren co tuc tien mat tai Viet Nam la **5%**, khau tru tai nguon.
</Note>

## Cac chi so lien quan

### Ty suat co tuc (Dividend Yield)

```
Dividend Yield = Co tuc hang nam / Gia co phieu hien tai × 100%
```

Vi du: co tuc 3,000d, gia hien tai 50,000d → Yield = 6%

### Ty le chi tra (Payout Ratio)

```
Payout Ratio = Tong co tuc chi tra / Loi nhuan rong × 100%
```

Ty le > 80% co the khong ben vung. Ty le 30-50% thuong la lanh manh.

## Tra cuu co tuc bang vnstock-js

```typescript
import { company } from "vnstock-js";

const events = await company.events({ ticker: "VNM" });
// Loc su kien co tuc
const dividends = events.filter(e =>
  e.eventName?.includes("co tuc") || e.eventName?.includes("dividend")
);
```

## Chien luoc dau tu co tuc

1. **Dividend investing**: Tap trung vao co phieu co ty suat co tuc cao va on dinh (REE, GAS, VNM)
2. **Dividend growth**: Chon cong ty tang co tuc deu hang nam
3. **DRIP (Dividend Reinvestment)**: Dung co tuc de mua them co phieu → hieu ung lai kep

## Luu y

1. Co tuc cao khong phai luc nao cung tot — kiem tra **payout ratio** va **dong tien tu do**
2. Gia co phieu **giam dung bang co tuc** vao ngay Ex-date
3. Co tuc co phieu **pha loang** gia — khong phai "duoc them tien"
4. So sanh yield voi lai suat tien gui de danh gia hap dan
```

**Step 2: Commit**

```bash
git add contents/docs/academy/dividend/index.mdx
git commit -m "docs: add academy article — dividend (cổ tức)"
```

---

## Task 4: Academy MDX — Dai Hoi Co Dong (Shareholder Meeting)

**Files:**
- Create: `contents/docs/academy/shareholder-meeting/index.mdx`

**Step 1: Tạo file MDX**

```mdx
---
title: Dai Hoi Co Dong (Shareholder Meeting)
description: Y nghia DHCD thuong nien va bat thuong, quyen bieu quyet va cac nghi quyet quan trong
---

## Dai hoi co dong la gi?

**Dai hoi co dong (DHCD)** la cuoc hop cao nhat cua cong ty co phan, noi cac co dong thuc hien quyen bieu quyet ve nhung van de quan trong nhat.

## Cac loai DHCD

### 1. DHCD Thuong Nien (AGM - Annual General Meeting)

- To chuc **moi nam 1 lan**, thuong trong Q1-Q2
- Bat buoc theo luat doanh nghiep
- Noi dung: bao cao ket qua kinh doanh, ke hoach nam moi, chia co tuc, bau HDQT

### 2. DHCD Bat Thuong (EGM - Extraordinary General Meeting)

- To chuc khi co van de **cap bach** can co dong bieu quyet
- Vi du: phat hanh them co phieu, sap nhap, thay doi nganh nghe kinh doanh

## Nhung noi dung quan trong tai DHCD

| Noi dung | Y nghia voi nha dau tu |
|----------|------------------------|
| Ke hoach doanh thu/loi nhuan | Dinh huong tang truong |
| Phuong an chia co tuc | Thu nhap co dong |
| Phat hanh them co phieu | Pha loang co phieu |
| Bau/mien nhiem HDQT | Thay doi lanh dao |
| Hop dong giao dich lien quan | Xung dot loi ich |

<Note>
Co dong can nam co phieu **truoc ngay dang ky cuoi cung** de du DHCD va bieu quyet.
</Note>

## Quyen cua co dong tai DHCD

1. **Quyen tham du**: truc tiep hoac uy quyen
2. **Quyen bieu quyet**: moi co phieu = 1 phieu bau (co phieu pho thong)
3. **Quyen trinh nghi quyet**: co dong/nhom co dong >= 5% von co the de xuat
4. **Quyen tiep can thong tin**: tai lieu hop phai duoc gui truoc >= 10 ngay

## Anh huong den gia co phieu

- **Truoc DHCD**: gia thuong tang nhe do ky vong vao ke hoach/co tuc
- **Sau DHCD**: phu thuoc vao noi dung nghi quyet — tich cuc hay tieu cuc
- **DHCD bat thanh** (khong du tham du): gia co the giam do bat on

## Theo doi lich DHCD

```typescript
import { company } from "vnstock-js";

const events = await company.events({ ticker: "VNM" });
// Loc su kien DHCD
const meetings = events.filter(e =>
  e.eventName?.includes("DHCD") || e.eventName?.includes("dai hoi")
);
```

## Luu y

1. Doc **tai lieu hop** truoc DHCD de nam bat cac de xuat quan trong
2. Chu y **phuong an phat hanh them** — day la yeu to pha loang co phieu
3. DHCD bat thuong thuong mang tin **bat ngo** — can theo doi sat
4. Ket qua bieu quyet anh huong truc tiep den chien luoc cong ty
```

**Step 2: Commit**

```bash
git add contents/docs/academy/shareholder-meeting/index.mdx
git commit -m "docs: add academy article — shareholder meeting (ĐHCĐ)"
```

---

## Task 5: Academy MDX — Phat Hanh Them (Rights Issue)

**Files:**
- Create: `contents/docs/academy/rights-issue/index.mdx`

**Step 1: Tạo file MDX**

```mdx
---
title: Phat Hanh Them Co Phieu (Rights Issue)
description: Co che phat hanh them, quyen mua uu dai, va tac dong pha loang len co phieu hien huu
---

## Phat hanh them la gi?

**Phat hanh them co phieu (Rights Issue)** la viec cong ty phat hanh co phieu moi de huy dong von, thuong kem theo **quyen mua uu dai** cho co dong hien huu.

## Cac hinh thuc phat hanh them

### 1. Phat hanh quyen (Rights Issue)

Co dong hien huu duoc quyen mua co phieu moi theo **ty le** va **gia uu dai**.

```
Vi du: Phat hanh quyen ty le 5:1, gia 15,000d
So huu 1,000 cp → Quyen mua them 200 cp voi gia 15,000d/cp
Chi phi: 200 × 15,000 = 3,000,000d
```

### 2. ESOP (Employee Stock Ownership Plan)

Phat hanh cho nhan vien, thuong voi gia uu dai hoac mien phi.

### 3. Phat hanh rieng le (Private Placement)

Phat hanh cho nha dau tu chien luoc, khong can quyen mua cua co dong hien huu.

<Note>
Phat hanh rieng le thuong gay **pha loang nhieu nhat** vi co dong cu khong co quyen mua bu.
</Note>

## Pha loang (Dilution) la gi?

Khi so co phieu tang ma loi nhuan khong tang tuong ung, **EPS (loi nhuan tren co phieu)** se giam:

```
EPS truoc = 10,000d (LN 100 ty / 10 trieu cp)
Phat hanh them 2 trieu cp
EPS sau = 8,333d (LN 100 ty / 12 trieu cp)
→ Pha loang 16.7%
```

## Cong thuc tinh gia dieu chinh

```
Gia dieu chinh = (Gia cu × So CP cu + Gia phat hanh × So CP moi) / Tong CP moi

Vi du:
Gia cu: 50,000d, So cu: 1,000 cp
Gia phat hanh: 15,000d, So moi: 200 cp

Gia dieu chinh = (50,000 × 1,000 + 15,000 × 200) / 1,200
             = 44,167d
```

## Timeline phat hanh quyen

```
Cong bo      DKCC          Ex-date       Thoi gian     Ngay
phuong an    (Record Date)               dang ky mua   giao dich CP moi
   |            |              |             |              |
   ▼            ▼              ▼             ▼              ▼
DHCD thong qua  Chot DS co dong  Gia dieu chinh  14-21 ngay    CP moi len san
```

## Tra cuu su kien phat hanh

```typescript
import { company } from "vnstock-js";

const events = await company.events({ ticker: "HPG" });
// Loc su kien phat hanh
const issues = events.filter(e =>
  e.eventName?.includes("phat hanh") || e.eventName?.includes("quyen mua")
);
```

## Luu y quan trong

1. **Quyen mua co gia tri** — neu khong muon mua, co the ban quyen (neu duoc phep)
2. **Khong thuc hien quyen = mat gia tri** vi bi pha loang ma khong co them co phieu
3. Kiem tra **muc dich huy dong von** — mo rong san xuat tot hon tra no
4. So sanh **gia phat hanh vs gia thi truong** — chenh lech cang lon, quyen cang co gia tri
5. Phat hanh rieng le cho doi tac chien luoc co the la **tin tich cuc** (doi tac uy tin)
```

**Step 2: Commit**

```bash
git add contents/docs/academy/rights-issue/index.mdx
git commit -m "docs: add academy article — rights issue (phát hành thêm)"
```

---

## Task 6: Routes Config — Thêm Section "Học Viện"

**Files:**
- Modify: `lib/routes-config.ts`

**Step 1: Thêm section Academy vào ROUTES array**

Thêm block sau vào cuối mảng `ROUTES` trong `lib/routes-config.ts`, sau section "Dữ Liệu":

```typescript
{
  title: "Học Viện",
  href: "/academy",
  noLink: true,
  items: [
    { title: "Ngày Không Hưởng Quyền", href: "/ex-date" },
    { title: "Chia Tách Cổ Phiếu", href: "/stock-split" },
    { title: "Cổ Tức", href: "/dividend" },
    { title: "Đại Hội Cổ Đông", href: "/shareholder-meeting" },
    { title: "Phát Hành Thêm", href: "/rights-issue" },
  ],
},
```

**Step 2: Verify** — chạy `pnpm dev` và kiểm tra sidebar hiển thị section "Học Viện" với 5 items.

**Step 3: Commit**

```bash
git add lib/routes-config.ts
git commit -m "feat: add Học Viện (Academy) section to docs sidebar"
```

---

## Task 7: Navbar Update — Thêm Link "Học Viện"

**Files:**
- Modify: `components/navbar.tsx`

**Step 1: Thêm nav link**

Trong mảng `NAVLINKS` tại `components/navbar.tsx`, thêm entry mới:

```typescript
{
  title: "Học Viện",
  href: "/docs/academy/ex-date",
},
```

Đặt sau "Tài Chính" hoặc vị trí phù hợp.

**Step 2: Commit**

```bash
git add components/navbar.tsx
git commit -m "feat: add Học Viện link to navbar"
```

---

## Task 8: Market Calendar Page — Trang Lịch Sự Kiện

**Files:**
- Create: `app/calendar/page.tsx`
- Create: `components/calendar/market-calendar.tsx`
- Create: `components/calendar/event-card.tsx`

**Step 1: Tạo API route hoặc server component fetch events**

`app/calendar/page.tsx`:

```tsx
import { Metadata } from "next";
import { company } from "vnstock-js";
import { MarketCalendar } from "@/components/calendar/market-calendar";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lịch Sự Kiện — vnstock-js",
  description: "Tổng hợp sự kiện quyền, cổ tức, ĐHCĐ sắp diễn ra trên thị trường",
};

// Danh sách mã phổ biến để fetch events
const POPULAR_TICKERS = [
  "VNM", "FPT", "VCB", "HPG", "MWG", "VHM", "VIC", "MSN",
  "TCB", "MBB", "ACB", "VPB", "STB", "TPB", "HDB",
  "GAS", "PLX", "PNJ", "REE", "DGC",
];

export default async function CalendarPage() {
  // Fetch events cho các mã phổ biến, parallel
  const results = await Promise.allSettled(
    POPULAR_TICKERS.map(async (ticker) => {
      const events = await company.events({ ticker });
      return events.map((e) => ({ ...e, ticker }));
    })
  );

  const allEvents = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => {
      // Sort by exDate or eventDate, newest first
      const dateA = a.exDate || a.eventDate || "";
      const dateB = b.exDate || b.eventDate || "";
      return dateB.localeCompare(dateA);
    });

  return (
    <div className="sm:container mx-auto w-[95vw] py-8">
      <MarketCalendar events={allEvents} />
    </div>
  );
}
```

**Step 2: Tạo MarketCalendar component**

`components/calendar/market-calendar.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CircleDollarSign,
  Scissors,
  Users,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { EventCard } from "./event-card";

// Phân loại sự kiện
const EVENT_TYPES = {
  dividend: { label: "Cổ tức", icon: CircleDollarSign, color: "text-green-500", academyLink: "/docs/academy/dividend" },
  split: { label: "Chia tách", icon: Scissors, color: "text-blue-500", academyLink: "/docs/academy/stock-split" },
  meeting: { label: "ĐHCĐ", icon: Users, color: "text-purple-500", academyLink: "/docs/academy/shareholder-meeting" },
  rights: { label: "Phát hành", icon: PlusCircle, color: "text-orange-500", academyLink: "/docs/academy/rights-issue" },
  other: { label: "Khác", icon: Calendar, color: "text-muted-foreground", academyLink: "/docs/academy/ex-date" },
} as const;

type EventType = keyof typeof EVENT_TYPES;

// Heuristic phân loại dựa trên eventName
function classifyEvent(eventName: string): EventType {
  const lower = eventName.toLowerCase();
  if (lower.includes("co tuc") || lower.includes("dividend")) return "dividend";
  if (lower.includes("chia") || lower.includes("tach") || lower.includes("split")) return "split";
  if (lower.includes("dhcd") || lower.includes("dai hoi") || lower.includes("meeting")) return "meeting";
  if (lower.includes("phat hanh") || lower.includes("quyen mua") || lower.includes("esop")) return "rights";
  return "other";
}

interface CorporateEvent {
  ticker: string;
  eventName: string;
  exDate?: string;
  eventDate?: string;
  recordDate?: string;
  [key: string]: unknown;
}

export function MarketCalendar({ events }: { events: CorporateEvent[] }) {
  const [filter, setFilter] = useState<EventType | "all">("all");

  const classifiedEvents = useMemo(
    () => events.map((e) => ({ ...e, type: classifyEvent(e.eventName || "") })),
    [events]
  );

  const filtered = filter === "all"
    ? classifiedEvents
    : classifiedEvents.filter((e) => e.type === filter);

  // Nhóm theo tháng
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const event of filtered) {
      const date = event.exDate || event.eventDate || "Chưa xác định";
      const month = date.slice(0, 7); // YYYY-MM
      if (!groups[month]) groups[month] = [];
      groups[month].push(event);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
          Lịch Sự Kiện
        </h1>
        <Link
          href="/docs/academy/ex-date"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Học Viện
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tất cả ({classifiedEvents.length})
        </button>
        {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(
          ([key, { label, icon: Icon, color }]) => {
            const count = classifiedEvents.filter((e) => e.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-3 h-3 ${filter === key ? "" : color}`} />
                {label} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Academy tip */}
      {filter !== "all" && (
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm">
                Tìm hiểu thêm về <strong>{EVENT_TYPES[filter].label}</strong> trong Học Viện
              </p>
            </div>
            <Link
              href={EVENT_TYPES[filter].academyLink}
              className="text-sm font-medium hover:underline shrink-0"
            >
              Đọc bài viết →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Events grouped by month */}
      {grouped.map(([month, events]) => (
        <div key={month}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {formatMonth(month)}
          </h2>
          <div className="space-y-2">
            {events.map((event, i) => (
              <EventCard key={`${event.ticker}-${i}`} event={event} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Không có sự kiện nào.
        </p>
      )}
    </div>
  );
}

function formatMonth(ym: string) {
  if (ym === "Chưa xác định") return ym;
  const [year, month] = ym.split("-");
  return `Tháng ${parseInt(month)}/${year}`;
}
```

**Step 3: Tạo EventCard component**

`components/calendar/event-card.tsx`:

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SymbolLink } from "@/components/stock-widget/stock-chart-dialog";

interface EventCardProps {
  event: {
    ticker: string;
    eventName: string;
    exDate?: string;
    eventDate?: string;
    recordDate?: string;
    type: string;
    [key: string]: unknown;
  };
}

const TYPE_COLORS: Record<string, string> = {
  dividend: "bg-green-500/10 text-green-500 border-green-500/20",
  split: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  meeting: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rights: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  other: "bg-muted text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  dividend: "Cổ tức",
  split: "Chia tách",
  meeting: "ĐHCĐ",
  rights: "Phát hành",
  other: "Khác",
};

export function EventCard({ event }: EventCardProps) {
  const date = event.exDate || event.eventDate || "—";

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Date */}
        <div className="text-center shrink-0 w-16">
          <p className="text-xs text-muted-foreground uppercase">
            {date !== "—" ? formatDay(date) : ""}
          </p>
          <p className="text-lg font-display font-bold">
            {date !== "—" ? new Date(date).getDate() : "—"}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SymbolLink symbol={event.ticker} className="text-sm font-bold" />
            <Badge variant="outline" className={`text-[0.6rem] px-1.5 py-0 ${TYPE_COLORS[event.type]}`}>
              {TYPE_LABELS[event.type]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {event.eventName}
          </p>
        </div>

        {/* Ex-date badge */}
        {event.exDate && (
          <div className="text-right shrink-0">
            <p className="text-[0.6rem] text-muted-foreground uppercase">Ex-date</p>
            <p className="text-xs font-mono">{event.exDate}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDay(dateStr: string) {
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return days[new Date(dateStr).getDay()];
}
```

**Step 4: Thêm route Calendar vào navbar**

Trong `components/navbar.tsx`, thêm vào `NAVLINKS`:

```typescript
{
  title: "Lịch Sự Kiện",
  href: "/calendar",
},
```

**Step 5: Verify** — `pnpm dev`, truy cập `/calendar`, kiểm tra:
- Hiển thị danh sách sự kiện nhóm theo tháng
- Filter theo loại sự kiện hoạt động
- Link Academy hiển thị đúng
- Click ticker mở stock detail

**Step 6: Commit**

```bash
git add app/calendar/page.tsx components/calendar/market-calendar.tsx components/calendar/event-card.tsx components/navbar.tsx
git commit -m "feat: add market calendar page with event filtering and academy links"
```

---

## Task 9: Event Markers on Chart — Đánh Dấu Sự Kiện Trên Candlestick Chart

**Files:**
- Modify: `components/stock-widget/stock-chart.tsx`

Lightweight Charts v5 hỗ trợ `setMarkers()` để đánh dấu trên candlestick series. Task này thêm markers cho các sự kiện quyền lên chart khi xem chi tiết mã.

**Step 1: Cập nhật interface StockChart nhận thêm events prop**

Trong `components/stock-widget/stock-chart.tsx`, thêm interface và prop:

```typescript
interface ChartEvent {
  date: string;      // YYYY-MM-DD
  type: "dividend" | "split" | "meeting" | "rights" | "other";
  label: string;     // Short label hiển thị trên chart
}

export function StockChart({
  data,
  smaData,
  events,
}: {
  data: ChartDataPoint[];
  smaData?: SmaPoint[];
  events?: ChartEvent[];
}) {
```

**Step 2: Thêm markers sau khi setData cho candleSeries**

Sau dòng `candleSeries.setData(...)`, thêm:

```typescript
// Event markers
if (events && events.length > 0) {
  const markers = events
    .filter((e) => {
      // Chỉ hiển thị events nằm trong range data
      const dates = data.map((d) => d.date);
      return dates.includes(e.date);
    })
    .map((e) => ({
      time: e.date as import("lightweight-charts").Time,
      position: "aboveBar" as const,
      color: e.type === "dividend" ? "#22c55e"
        : e.type === "split" ? "#3b82f6"
        : e.type === "meeting" ? "#a855f7"
        : e.type === "rights" ? "#f97316"
        : "#9ca3af",
      shape: "arrowDown" as const,
      text: e.label,
    }))
    .sort((a, b) => (a.time as string).localeCompare(b.time as string));

  candleSeries.setMarkers(markers);
}
```

**Step 3: Truyền events từ stock detail page**

Trong page sử dụng `StockChart` (ví dụ `app/stock/[symbol]/page.tsx`), fetch events và truyền xuống:

```typescript
const eventsData = await company.events({ ticker: symbol });
const chartEvents = eventsData
  .filter((e) => e.exDate || e.eventDate)
  .map((e) => ({
    date: e.exDate || e.eventDate || "",
    type: classifyEvent(e.eventName || ""),
    label: e.eventName?.slice(0, 15) || "Event",
  }));

// Truyền vào component
<StockChart data={data} smaData={smaData} events={chartEvents} />
```

**Step 4: Verify** — xem chart `/stock/VNM`, kiểm tra markers hiển thị đúng vị trí với màu sắc tương ứng.

**Step 5: Commit**

```bash
git add components/stock-widget/stock-chart.tsx app/stock/\[symbol\]/page.tsx
git commit -m "feat: add corporate event markers on candlestick chart"
```

---

## Thứ tự thực hiện

```
Task 1-5 (song song) → Task 6 → Task 7 → Task 8 → Task 9
   Academy MDX          Routes    Navbar    Calendar   Chart markers
```

Task 1-5 là MDX content, hoàn toàn độc lập, có thể chạy song song.
Task 6-7 là config nhỏ, phụ thuộc vào Task 1-5 để có content hiển thị.
Task 8-9 là feature mới, nên làm sau khi có Academy content để link đúng.

---

## Lưu ý cho người thực hiện

1. **vnstock-js `company.events()` API**: Cần kiểm tra xem response shape thực tế (field names) có khớp với code trong plan. Nếu khác, adjust field names tương ứng.
2. **POPULAR_TICKERS list**: Có thể cần điều chỉnh hoặc lấy dynamic từ `stock.topGainers()` thay vì hardcode.
3. **classifyEvent heuristic**: Logic phân loại dựa trên string matching. Nếu API trả về field `eventType` riêng, ưu tiên dùng field đó.
4. **SymbolLink component**: Được import từ `@/components/stock-widget/stock-chart-dialog` — kiểm tra component này tồn tại và hoạt động đúng.
5. **MDX content**: Viết không dấu (khong dau) theo convention hiện tại của project (xem `contents/docs/key-features/advanced/calendar/index.mdx`).
