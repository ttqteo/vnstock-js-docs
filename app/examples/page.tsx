import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ví Dụ",
};

export default async function BlogIndexPage() {
  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="mb-7 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Một số ví dụ mẫu</h1>
        <p className="text-muted-foreground">
          Đây là ví dụ cơ bản, tuỳ mọi người tuỳ chỉnh.
        </p>
      </div>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 sm:gap-8 gap-4 mb-5">
        TBD
      </div>
    </div>
  );
}
