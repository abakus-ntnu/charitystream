import { useContext } from "react";
import Link from "next/link";
import Alerts from "../../lib/Alerts";
import State from "../../lib/State";
import { useRouter } from "next/router";

const links = [
  { href: "/admin/vipps", page: "Legg til donasjoner" },
  { href: "/admin/beer", page: "Oppdater antall øl" },
  { href: "/admin/auction", page: "Stilleauksjon" },
  { href: "/admin/stretchGoals", page: "Stretch Goals" },
  { href: "/", page: "Forlat adminsiden" },
];

const Layout = ({ children, full = false }) => {
  const { alerts } = useContext(Alerts);
  const { state } = useContext(State);

  const router = useRouter();

  return (
    <>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center flex-wrap gap-5 py-4 justify-center">
            <h1 className="text-xl mr-4">Veldedighetsfest</h1>
            {state?.token &&
              links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={`px-3 py-1 rounded-md text-large font-medium ${
                      link.href === "/"
                        ? "underline"
                        : "bg-white text-black hover:bg-gray-400"
                    } ${
                      router.pathname === link.href
                        ? "bg-slate-400 hover:bg-slate-600"
                        : ""
                    }`}
                  >
                    {link.page}
                  </a>
                </Link>
              ))}
          </div>
        </div>
      </nav>
      <div
        className="bg-gray-300 font-sans antialiased w-full flex"
        style={{ minHeight: "100vh" }}
      >
        <div className={`container mx-auto my-10`}>
          <div
            className={`relative w-5/6 md:w-4/6 ${
              full ? "lg:w-5/6 xl:w-4/6" : "lg:w-3/6 xl:w-2/6"
            } mx-auto`}
          >
            <div className=" sticky top-10 z-50">
              {alerts.map((alert) => (
                <div
                  key={alert.text}
                  className={`text-white px-6 py-4 border-0 rounded relative mb-4 bg-${alert.color}-500`}
                >
                  <span className="text-xl inline-block mr-5 align-middle">
                    <i className="fas fa-bell" />
                  </span>
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
