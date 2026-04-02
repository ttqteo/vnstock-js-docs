import { ThemeProvider } from "@/components/contexts/theme-provider";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { NavigationProgress } from "@/components/navigation-progress";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
        className={`${inter.variable} ${manrope.variable} font-sans antialiased tracking-wide`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProgress />
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
