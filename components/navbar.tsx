import { ModeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { SheetClose } from "@/components/ui/sheet";
import { page_routes } from "@/lib/routes-config";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Anchor from "./anchor";
import Search from "./search";

export const NAVLINKS = [
  {
    title: "Tài Liệu",
    href: `/docs${page_routes[0].href}`,
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
    title: "Tài Chính",
    href: "/finance",
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
        const Comp = (
          <Anchor
            key={item.title + item.href}
            activeClassName="!text-primary dark:font-medium font-semibold"
            absolute
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
