"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleDollarSign,
  Scissors,
  Users,
  PlusCircle,
  CalendarClock,
} from "lucide-react";

const ACADEMY_TOPICS = [
  {
    id: "ex-date",
    label: "Ex-date",
    icon: CalendarClock,
    title: "Ngày Không Hưởng Quyền (Ex-date)",
    content: [
      "**Ex-date** là ngày mà người mua cổ phiếu sẽ không được hưởng quyền lợi (cổ tức, quyền mua, thưởng cổ phiếu) đã công bố trước đó.",
      "Mua **trước** Ex-date → được hưởng quyền. Mua **từ** Ex-date → không được hưởng.",
      "Tại VN, Ex-date thường là **T+1** trước ngày ĐKCC (do chu kỳ thanh toán T+2 của VSD).",
      "Giá tham chiếu sẽ được **điều chỉnh giảm** tương ứng với giá trị quyền lợi vào ngày Ex-date.",
    ],
  },
  {
    id: "dividend",
    label: "Cổ tức",
    icon: CircleDollarSign,
    title: "Cổ Tức (Dividend)",
    content: [
      "**Cổ tức** là phần lợi nhuận công ty phân phối cho cổ đông — bằng tiền mặt, cổ phiếu, hoặc tài sản.",
      "**Dividend Yield** = Cổ tức hàng năm / Giá hiện tại × 100%. Ví dụ: 3,000đ / 50,000đ = 6%.",
      "Thuế TNCN trên cổ tức tiền mặt tại VN: **5%**, khấu trừ tại nguồn.",
      "Giá cổ phiếu **giảm đúng bằng cổ tức** vào ngày Ex-date — đây là điều chỉnh kỹ thuật.",
    ],
  },
  {
    id: "stock-split",
    label: "Chia tách",
    icon: Scissors,
    title: "Chia Tách Cổ Phiếu (Stock Split)",
    content: [
      "**Chia tách** là tăng số lượng cổ phiếu bằng cách chia nhỏ, **không thay đổi tổng vốn hóa**.",
      "Ví dụ 5:1: 100 cp giá 500,000đ → 500 cp giá 100,000đ. Tổng giá trị vẫn = 50 triệu.",
      "Mục đích: tăng thanh khoản, hạ giá để thu hút NĐT cá nhân, đạt tiêu chí niêm yết.",
      "**Gộp cổ phiếu** (reverse split) là ngược lại — giảm số lượng, tăng giá tương ứng.",
    ],
  },
  {
    id: "shareholder-meeting",
    label: "ĐHCĐ",
    icon: Users,
    title: "Đại Hội Cổ Đông (ĐHCĐ)",
    content: [
      "**ĐHCĐ** là cuộc họp cao nhất của công ty cổ phần — nơi cổ đông biểu quyết các vấn đề quan trọng.",
      "**Thường niên (AGM)**: mỗi năm 1 lần, Q1-Q2. **Bất thường (EGM)**: khi có vấn đề cấp bách.",
      "Nội dung chính: kế hoạch kinh doanh, chia cổ tức, phát hành thêm, bầu HĐQT.",
      "Cần nắm cổ phiếu **trước ngày ĐKCC** để tham dự và biểu quyết.",
    ],
  },
  {
    id: "rights-issue",
    label: "Phát hành",
    icon: PlusCircle,
    title: "Phát Hành Thêm (Rights Issue)",
    content: [
      "**Phát hành thêm** là phát hành cổ phiếu mới để huy động vốn, thường kèm quyền mua ưu đãi.",
      "Khi số CP tăng mà LN không tăng → **EPS giảm** = pha loãng. VD: thêm 20% CP → pha loãng ~16.7%.",
      "**Quyền mua có giá trị** — không thực hiện = mất giá trị do pha loãng.",
      "Phát hành riêng lẻ (private placement) gây pha loãng nhiều nhất vì cổ đông cũ không có quyền mua.",
    ],
  },
] as const;

export function AcademyPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display uppercase tracking-wider">
          Học Viện
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="ex-date">
          <TabsList className="w-full flex-wrap h-auto gap-0.5">
            {ACADEMY_TOPICS.map((topic) => (
              <TabsTrigger
                key={topic.id}
                value={topic.id}
                className="text-xs flex-1 min-w-0 gap-1"
              >
                <topic.icon className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">{topic.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {ACADEMY_TOPICS.map((topic) => (
            <TabsContent key={topic.id} value={topic.id} className="mt-3">
              <h3 className="font-semibold text-sm mb-2">{topic.title}</h3>
              <ul className="space-y-1.5">
                {topic.content.map((point, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: point
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Export topic data for tooltip usage in Calendar
export const ACADEMY_TOOLTIPS: Record<string, string> = {
  dividend: "Cổ tức là phần lợi nhuận công ty phân phối cho cổ đông. Giá sẽ điều chỉnh giảm vào ngày Ex-date.",
  split: "Chia tách cổ phiếu tăng số lượng CP mà không thay đổi tổng vốn hóa. Giá điều chỉnh tương ứng.",
  meeting: "Đại Hội Cổ Đông là cuộc họp để biểu quyết các vấn đề quan trọng: kế hoạch, cổ tức, phát hành thêm.",
  rights: "Phát hành thêm cổ phiếu để huy động vốn. Có thể gây pha loãng EPS cho cổ đông hiện hữu.",
  other: "Sự kiện quyền — ngày Ex-date là ngày mua CP sẽ không được hưởng quyền lợi đã công bố.",
};
