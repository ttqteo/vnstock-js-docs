"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Copy from "@/components/markdown/copy";

interface ExampleBlockProps {
  title: string;
  code: string;
  children: React.ReactNode;
}

export function ExampleBlock({ title, code, children }: ExampleBlockProps) {
  return (
    <div className="space-y-2">
      <p className="text-lg font-bold">{title}</p>
      <Tabs defaultValue="preview" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="mb-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="pt-4">
          <div className="rounded-lg border p-4">{children}</div>
        </TabsContent>
        <TabsContent value="code" className="pt-4">
          <div className="relative rounded-lg border bg-muted/50">
            <div className="absolute right-3 top-3 z-10">
              <Copy content={code} />
            </div>
            <pre className="overflow-x-auto p-4 text-sm">
              <code>{code}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
