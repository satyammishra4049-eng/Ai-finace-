"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Close" },
  { href: "/books", label: "Books" },
  { href: "/ledger", label: "Bank file" },
  { href: "/matches", label: "Matches" },
  { href: "/exceptions", label: "Exceptions" },
  { href: "/cash", label: "Cash" },
  { href: "/desk", label: "Controller desk" }
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="shell">
      <aside className="rail">
        <div className="mark">
          AI Finance Controller
          <span>Finance · Automated Close</span>
        </div>
        <nav>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="rail-foot">HDFC Bank · 4418<br />As of 2 September 2026</div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
