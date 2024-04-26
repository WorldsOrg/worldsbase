"use client";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, HomeIcon, XMarkIcon, TableCellsIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { MdExitToApp, MdGamepad, MdGames, MdQueryStats, MdSettings, MdSupervisedUserCircle, MdVerifiedUser } from "react-icons/md";
import { GoWorkflow } from "react-icons/go";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/authContext";
import ToggleButton from "../ui/ToggleButton";
import Tooltip from "../ui/tooltip";
import { TbSettingsAutomation } from "react-icons/tb";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const pathname = usePathname();

  const [navigation, setNavigation] = useState([
    { name: "Home", href: "/dashboard", icon: HomeIcon, current: false },
    {
      name: "Table Editor",
      href: "/dashboard/table_editor",
      icon: TableCellsIcon,
      current: false,
    },
    {
      name: "Composer",
      href: "/dashboard/composer",
      icon: GoWorkflow,
      current: false,
    },
    {
      name: "Composer V2 Alpha",
      href: "/dashboard/flow",
      icon: TbSettingsAutomation,
      current: false,
    },
    {
      name: "Documentation",
      href: "/dashboard/docs/api",
      icon: BookOpenIcon,
      current: false,
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: MdSupervisedUserCircle,
      current: false,
    },
    {
      name: "Demo Game",
      href: "/dashboard/demo_game",
      icon: MdGamepad,
      current: false,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: MdSettings,
      current: false,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: MdQueryStats,
    },
  ]);

  // Update the navigation state based on the current pathname
  useEffect(() => {
    const currentPath = pathname;
    setNavigation((navigation) =>
      navigation.map((item) => ({
        ...item,
        current: item.href === currentPath,
      }))
    );
  }, [pathname]); // Depend on pathname

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth");
    }
  }, [searchParams]);

  return (
    <div className="tableFont">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-sidebar" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 z-40 flex justify-center w-16 pt-5 left-full">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex flex-col px-6 pb-2 overflow-y-auto bg-sidebar grow gap-y-5 ring-1 ring-white/10">
                  <div className="flex items-center h-16 shrink-0">
                    <img className="w-auto h-8" src="/worlds.png" alt="p2 logo" />
                    <div className="flex-1 pl-2 text-sm font-semibold leading-6 text-white">Worlds</div>
                  </div>
                  <nav className="flex flex-col flex-1">
                    <ul role="list" className="flex-1 -mx-2 space-y-1">
                      <>
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current ? "bg-hoverBg text-primary" : "text-gray-400 hover:text-primary hover:bg-hoverBg",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold "
                              )}
                            >
                              <item.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                              {item.name}
                            </a>
                          </li>
                        ))}
                        <li>
                          <ToggleButton isMobile />
                        </li>
                      </>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static sidebar for desktop */}
      <div className="hidden border-r border-gray-500 bg-sidebar lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-20 lg:overflow-y-auto lg: lg:pb-4 ">
        <div className="flex items-center justify-center h-16 shrink-0">
          <img className="w-auto h-10" src="/worlds.png" alt="p2 logo" />
        </div>
        <nav className="mt-8">
          <ul role="list" className="flex flex-col items-center space-y-1">
            <>
              {navigation.map((item) => (
                <Tooltip key={item.name} label={item.name} placement="right">
                  <li>
                    <button
                      onClick={() => {
                        setNavigation(
                          navigation.map((nav) => ({
                            ...nav,
                            current: nav.name === item.name,
                          }))
                        ),
                          router.push(item.href);
                      }}
                      className={classNames(
                        item.current ? "bg-hoverBg text-primary" : "text-gray-400 hover:text-primary hover:bg-hoverBg",
                        "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                      <span className="sr-only">{item.name}</span>
                    </button>
                  </li>
                </Tooltip>
              ))}
              <Tooltip label="Theme" placement="right">
                <li>
                  <ToggleButton />
                </li>
              </Tooltip>
              <Tooltip label="Logout" placement="right">
                <li>
                  <button onClick={logout} className="flex p-3 text-sm font-semibold leading-6 text-gray-400 rounded-md hover:text-primary hover:bg-hoverBg group gap-x-3">
                    <MdExitToApp className="w-6 h-6" />
                  </button>
                </li>
              </Tooltip>
            </>
          </ul>
        </nav>
      </div>

      <div className="sticky top-0 z-40 flex items-center px-4 py-4 border-b border-gray-500 shadow-sm bg-sidebar gap-x-6 sm:px-6 lg:hidden">
        <button type="button" className="-m-2.5 p-2.5 text-gray-400 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">Dashboard</div>
      </div>

      <main className="lg:pl-20">
        <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">{children}</div>
      </main>
    </div>
  );
}
