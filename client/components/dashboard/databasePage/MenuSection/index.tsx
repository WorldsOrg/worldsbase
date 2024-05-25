"use client";
import { v4 as uuidv4 } from "uuid";
import MenuList from "./MenuList";

const databaseManagement = [
  {
    name: "Tables",
    link: "tables",
  },
  {
    name: "Functions",
    link: "functions",
  },
  {
    name: "Triggers",
    link: "triggers",
  },
  {
    name: "Enumerated Types",
    link: "enumerated_types",
  },
  {
    name: "Indexes",
    link: "indexes",
  },
  {
    name: "Publications",
    link: "publications",
  },
];

const accessControl = [
  {
    name: "Roles",
    link: "roles",
  },
  {
    name: "Policies",
    link: "policies",
  },
];

const platforms = [
  {
    name: "Backups",
    link: "backups",
  },
  {
    name: "Wrappers",
    link: "wrappers",
  },
  {
    name: "Migrations",
    link: "migrations",
  },
  {
    name: "Webhooks",
    link: "webhooks",
  },
];

const menuLists = [
  {
    title: "Database Management",
    list: databaseManagement,
  },
  {
    title: "Access Control",
    list: accessControl,
  },
  {
    title: "Platform",
    list: platforms,
  },
];

export default function MenuSection() {
  return (
    <div className="flex flex-col pr-2 overflow-y-visible border-r border-borderColor grow gap-y-5 bg-background">
      <div className="flex items-center h-16 shrink-0"></div>
      <nav className="flex flex-col flex-1">
        <ul role="list" className="space-y-1">
          <div className="flex flex-col gap-2 mb-4 mr-8 text-white">
            {menuLists.map((item, index) => (
              <div key={uuidv4()}>
                <MenuList title={item.title} list={item.list} />
                {menuLists.length - 1 !== index && (
                  <div className="w-full h-[1px] bg-titleColor my-3" />
                )}
              </div>
            ))}
          </div>
        </ul>
      </nav>
    </div>
  );
}
