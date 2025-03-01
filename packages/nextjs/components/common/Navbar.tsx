"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationItem } from "~~/types/types";

function Nabar({ navItems, className }: { navItems: NavigationItem[]; className?: string }) {
  const pathname = usePathname();
  return (
    <div className={`flex gap-2 sm:gap-7 flex-wrap justify-center ${className}`}>
      {navItems.map(({ id, href, label }) => (
        <Link
          href={href}
          key={id}
          className={`${pathname.startsWith(href) ? "text-white-500" : "text-gray-500"} sm:font-bold`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default Nabar;
