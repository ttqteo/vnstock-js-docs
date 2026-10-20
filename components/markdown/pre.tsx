import { ComponentProps } from "react";
import CodeFrame from "./code-frame";

export default function Pre({
  children,
  raw,
  ...rest
}: ComponentProps<"pre"> & { raw?: string }) {
  return (
    <CodeFrame raw={raw!}>
      <pre {...rest}>{children}</pre>
    </CodeFrame>
  );
}
