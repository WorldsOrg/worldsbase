"use client";
import { ChangeEvent, Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, PencilSquareIcon, MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@chakra-ui/react";
import _debounce from "lodash/debounce";
import { isEmpty } from "lodash";
import { useTable } from "@/context/tableContext";
import IconInput from "@/components/ui/IconInput";
import NoSearchResult from "@/components/ui/table/NoSearchResult";
import TableNameButton from "@/components/ui/table/TableNameButton";
import Button from "@/components/ui/table/Button";

export default function AppLayout({ children, setOpen }: { children: React.ReactNode; setOpen: (state: boolean) => void }) {
  const { selectedTable, setSelectTable, navigation, getTables } = useTable();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchedTable, setSearchedTable] = useState("");
  const [filteredTables, setFilteredTables] = useState(navigation);

  useEffect(() => {
    setFilteredTables(navigation);
  }, [navigation]);

  const debouncedSearch = _debounce((value: string) => {
    const filteredData = navigation.filter((item) => item.table_name.toLowerCase().includes(value.toLowerCase().trim()));
    setFilteredTables(filteredData);
  }, 500);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchedTable(value);
    debouncedSearch(value);
  };

  const clearSearchInput = () => {
    setSearchedTable("");
    setFilteredTables(navigation);
  };

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background" />
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
                  <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex flex-col px-6 pb-2 overflow-y-auto grow gap-y-5 bg-background">
                  <div className="flex items-center h-16 shrink-0"></div>
                  <nav className="flex flex-col flex-1">
                    <ul role="list" className="flex flex-col flex-1 gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          <div className="flex flex-col gap-2 mb-4">
                            <li key="1">
                              <Button
                                className="items-center w-full h-10 text-xs leading-6 border rounded-md border-primary text-primary bg-softBg hover:bg-hoverBg"
                                onClick={() => setOpen(true)}
                                icon={<PencilSquareIcon className="w-4 h-4 text-primary" />}
                                text="Add new table"
                              />
                            </li>
                            <li>
                              <IconInput
                                type="string"
                                icon={<MagnifyingGlassIcon className="w-4 h-4 text-primary" />}
                                rightIcon={searchedTable?.length > 0 ? <XMarkIcon className="w-4 h-4 cursor-pointer text-primary" onClick={clearSearchInput} /> : null}
                                placeholder="Search tables"
                                value={searchedTable}
                                onChange={handleInputChange}
                                className="text-xs bg-background text-primary"
                              />
                            </li>
                          </div>
                          <div className="flex items-center justify-between text-sm text-primary">
                            Tables ({filteredTables?.length})
                            <ArrowPathIcon className="w-4 h-4 text-primary" />
                          </div>
                          {!isEmpty(filteredTables) ? (
                            filteredTables.map((item) => (
                              <li key={item.table_name}>
                                <TableNameButton
                                  tableName={item.table_name}
                                  textLength={32}
                                  maxWidth={270}
                                  onClick={() => {
                                    setSelectTable(item.table_name);
                                  }}
                                  selectedTable={selectedTable}
                                />
                              </li>
                            ))
                          ) : searchedTable?.length > 0 ? (
                            <div className="mt-2">
                              <NoSearchResult text={searchedTable} />
                            </div>
                          ) : null}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex w-60 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-col pr-2 overflow-y-visible border-r border-borderColor grow gap-y-5 bg-background">
          <div className="flex items-center h-16 shrink-0"></div>
          <nav className="flex flex-col flex-1">
            <ul role="list" className="space-y-1">
              <div className="flex flex-col gap-2 mb-4 mr-8">
                <li key="1">
                  <Button
                    className="flex w-full h-10 text-xs font-semibold leading-6 border rounded-md border-primary text-primary hover:bg-softBg"
                    onClick={() => setOpen(true)}
                    icon={<PencilSquareIcon className="w-4 h-4 text-primary" />}
                    text="Add new table"
                  />
                </li>
                <li>
                  <IconInput
                    type="string"
                    icon={<MagnifyingGlassIcon className="w-4 h-4 text-primary" />}
                    rightIcon={searchedTable?.length > 0 ? <XMarkIcon className="w-4 h-4 cursor-pointer text-primary" onClick={clearSearchInput} /> : null}
                    placeholder="Search tables"
                    value={searchedTable}
                    onChange={handleInputChange}
                    className="text-xs border-primary bg-background text-primary"
                  />
                </li>
              </div>
              <div className="flex items-center justify-between text-sm text-primary">
                Tables ({filteredTables?.length})
                <Tooltip label="Refresh" className=" bg-background text-primary">
                  <ArrowPathIcon className="w-4 h-4 cursor-pointer text-primary" onClick={getTables} />
                </Tooltip>
              </div>
              <li
                className="flex flex-col gap-2 overflow-y-auto"
                style={{
                  maxHeight: "calc(100vh - 240px)",
                }}
              >
                {!isEmpty(filteredTables) ? (
                  filteredTables.map((item) => (
                    <div key={item.table_name}>
                      <TableNameButton
                        tableName={item.table_name}
                        textLength={27}
                        maxWidth={190}
                        onClick={() => {
                          setSelectTable(item.table_name);
                        }}
                        selectedTable={selectedTable}
                      />
                    </div>
                  ))
                ) : searchedTable?.length > 0 ? (
                  <div className="mt-2">
                    <NoSearchResult text={searchedTable} />
                  </div>
                ) : null}
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="sticky flex items-center px-4 py-4 shadow-sm gap-x-6 bg-background sm:px-6 lg:hidden">
        <button type="button" className="-m-2.5 p-2.5 text-primary lg:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-primary">Dashboard</div>
      </div>

      <div className="mt-20 overflow-y-auto lg:ml-64">{children}</div>
    </div>
  );
}
