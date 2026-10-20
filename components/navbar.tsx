import { ModeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { SheetClose } from "@/components/ui/sheet";
import { page_routes } from "@/lib/routes-config";
import { ArrowUpRight, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Anchor from "./anchor";
import Search from "./search";

const AI_PAGE = "/docs/getting-started/ai";

// exact: active only on its own page; exclude: pages another link owns.
export const NAVLINKS: { title: string; href: string; external?: true; exact?: true; exclude?: string[] }[] = [
  {
    title: "Tài Liệu",
    href: `/docs${page_routes[0].href}`,
    exclude: [AI_PAGE],
  },
  {
    title: "Dùng Với AI",
    href: AI_PAGE,
    exact: true,
  },
  {
    title: "Ví Dụ",
    href: "/examples",
  },
  {
    title: "Bài Viết",
    href: "/blog",
  },
  {
    title: "Demo",
    href: "https://vnstock-js.vercel.app",
    external: true,
  },
  // {
  //   title: "Lịch Sự Kiện",
  //   href: "/calendar",
  // },
];

export function Navbar() {
  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50 bg-background dark:bg-background/80 dark:backdrop-blur-xl">
      <div className="sm:container mx-auto w-[95vw] h-full flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-5">
          <MobileMenu />
          <div className="flex items-center gap-6">
            <div className="flex">
              <Logo />
            </div>
            <div className="lg:flex hidden items-center gap-4 text-sm font-medium text-muted-foreground">
              <NavMenu />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search />
            <Link
              href="https://github.com/ttqteo/vnstock-js"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground"
            >
              <Github className="w-[1.1rem] h-[1.1rem]" />
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/vnstock.png"
        alt="vnstock-js"
        width={24}
        height={24}
        className="rounded-full"
      />
      <h2 className="hidden sm:block text-md font-bold font-display tracking-wider">
        vnstock-js
      </h2>
    </Link>
  );
}

export function NavMenu({ isSheet = false }) {
  return (
    <>
      {NAVLINKS.map((item) => {
        const Comp = item.external ? (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 dark:text-stone-300/85 text-stone-800 hover:text-primary"
          >
            {item.title}
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        ) : (
          <Anchor
            key={item.title + item.href}
            activeClassName="!text-primary dark:font-medium font-semibold"
            absolute={!item.exact}
            exclude={item.exclude}
            className="flex items-center gap-1 dark:text-stone-300/85 text-stone-800"
            href={item.href}
          >
            {item.title}
          </Anchor>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
