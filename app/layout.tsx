import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vnstock-js-docs",
  metadataBase: new URL("https://vnstock-js-docs.vercel.app/"),
  description:
    "This website, named 'vnstock-js,' serves as the official documentation for an open-source JavaScript library that provides seamless access to Vietnam Stock Market data, built with Next.js for a clear and responsive user experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.className} font-regular antialiased tracking-wide`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="sm:container mx-auto w-[90vw] h-auto scroll-smooth">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
