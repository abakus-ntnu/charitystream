import { useContext } from "react";
import Link from "next/link";
import Alerts from "../../lib/Alerts";

const links = [
<<<<<<< HEAD
  { href: "/admin/vipps", page: "Legg til donasjoner" },
  { href: "/admin/beer", page: "Oppdater antall øl" },
  { href: "/admin/auction", page: "Stilleauksjon" },
=======
  { href: "/", page: "Festsiden" },
  { href: "/admin/vipps", page: "Legg til donasjoner" },
  { href: "/admin/beer", page: "Oppdater antall øl" },
>>>>>>> 2a720ed8471e1b0c63086cb11fc7a914b8013ac9
];

const Layout = ({ children, full = false }) => {
  const { alerts } = useContext(Alerts);
  return (
    <>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 ">
<<<<<<< HEAD
=======
            <h1 className="text-xl">Veldedighetsfest 2021</h1>
>>>>>>> 2a720ed8471e1b0c63086cb11fc7a914b8013ac9
            {links.map((link) => (
              <div className="bg-white px-3 py-2 mx-5 rounded-md text-large font-medium text-black">
                <Link href={link.href}>{link.page}</Link>
              </div>
            ))}
          </div>
        </div>
      </nav>
      <div
        className="bg-gray-300 font-sans antialiased w-full flex"
        style={{ height: "100vh" }}
      >
        <div className={`container mx-auto ${full ? "my-10" : "my-60"}`}>
          <div
            className={`relative w-5/6 md:w-4/6 ${
              full ? "lg:w-5/6 xl:w-4/6" : "lg:w-3/6 xl:w-2/6"
            } mx-auto`}
          >
            <div className=" h-20 min-h-20 sticky top-10 z-50">
              {alerts.map((alert) => (
                <div
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
