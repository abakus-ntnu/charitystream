"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Alerts, { Alert, AlertsContextType } from "@/lib/Alerts";
import State, { StateContextType } from "@/lib/State";

const links = [
  { href: "/admin/vipps", page: "Legg til donasjoner" },
  { href: "/admin/beer", page: "Oppdater antall øl" },
  { href: "/admin/auction", page: "Stilleauksjon" },
  { href: "/admin/stretchGoals", page: "Stretch Goals" },
  { href: "/", page: "Forlat adminsiden" },
];

const Layout = ({ children }) => {
  const { alerts } = useContext(Alerts) as AlertsContextType;
  const { state } = useContext(State) as StateContextType;

  const pathname = usePathname();

  return (
    <>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center flex-wrap gap-5 py-4 justify-center">
            <h1 className="text-xl mr-4">Veldedighetsfest</h1>
            {state?.token &&
              links.map((link) => {
                const isActive = pathname === link.href;
                const base =
                  link.href === "/"
                    ? "underline"
                    : "bg-white text-black hover:bg-gray-400";
                const active = isActive
                  ? "bg-slate-400 hover:bg-slate-600"
                  : "";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1 rounded-md text-large font-medium ${base} ${active}`}
                  >
                    {link.page}
                  </Link>
                );
              })}
          </div>
        </div>
      </nav>
      <div
        className="bg-gray-300 font-sans antialiased w-full flex"
        style={{ minHeight: "100vh" }}
      >
        <div className={`container mx-auto my-10`}>
          <div>
            <div className="fixed bottom-1 left-3 z-50">
              {alerts.map((alert: Alert) => (
                <div
                  key={alert.text}
                  className={`text-white px-3 py-2 border-0 rounded relative mb-2 bg-${alert.color}-500`}
                >
                  <span className="inline-block align-middle mr-8">
                    {alert.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-white  shadow-xl">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
