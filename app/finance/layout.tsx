import { PropsWithChildren } from "react";

export default function FinanceLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col pt-4 pb-10 w-full mx-auto">
      {children}
    </div>
  );
}
