"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/misc";
import { useCartStore } from "@/lib/store/cartStore";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

function Icon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (a) => <Icon active={a} path="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  },
  {
    href: "/stations",
    label: "Charging",
    icon: (a) => <Icon active={a} path="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  },
  {
    href: "/parking",
    label: "Parking",
    icon: (a) => <Icon active={a} path="M5 21V4h8a5 5 0 0 1 0 10H5" />,
  },
  {
    href: "/utilities",
    label: "Utilities",
    icon: (a) => <Icon active={a} path="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0" />,
  },
  {
    href: "/emergency",
    label: "Rescue",
    icon: (a) => <Icon active={a} path="M12 2 3 7v6c0 5 3.8 8.4 9 9 5.2-.6 9-4 9-9V7l-9-5ZM12 8v4M12 16h.01" />,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-brand-600" : "text-ink-500 hover:text-ink-700",
                )}
              >
                {item.icon(active)}
                <span>{item.label}</span>
                {item.href === "/utilities" && cartCount > 0 && (
                  <span className="absolute right-1/4 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}