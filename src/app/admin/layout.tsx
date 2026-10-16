"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Alerts, { Alert, AlertsContextType } from "@/lib/Alerts";
import State, { StateContextType } from "@/lib/State";

const links = [
  { href: "/admin/vipps", page: "Legg til donasjoner" },
  { href: "/admin/beer", page: "Baren" },
  { href: "/admin/auction", page: "Stilleauksjon" },
  { href: "/admin/stretchGoals", page: "Stretch Goals" },
  { href: "/", page: "Forlat adminsiden" },
];

const Layout = ({ children }) => {
  const { alerts } = useContext(Alerts) as AlertsContextType;
  const { state } = useContext(State) as StateContextType;

  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full max-w-content mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <Link href="/admin" className="logo">
          Abakus<span className="logo__accent">Admin</span>
        </Link>
        {state?.token && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const tone =
                link.href === "/"
                  ? "text-red-5 hover:underline"
                  : isActive
                  ? "text-text"
                  : "text-text-dim hover:text-text";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`text-sm font-semibold whitespace-nowrap transition-colors ${tone} ${
                    isActive
                      ? "underline underline-offset-8 decoration-2 decoration-red-5"
                      : ""
                  }`}
                >
                  {link.page}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
      <main className="flex-1 w-full max-w-content mx-auto px-4 md:px-8 pb-10">
        {children}
      </main>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        {alerts.map((alert: Alert) => (
          <div
            key={alert.text}
            role="status"
            className="flex items-stretch gap-4 bg-panel pr-5 max-w-sm animate-pop-in"
          >
            <div
              className={`w-2 flex-shrink-0 ${
                alert.color === "green" ? "bg-green-6" : "bg-red-5"
              }`}
            />
            <span className="py-3 text-sm font-semibold">{alert.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layout;
