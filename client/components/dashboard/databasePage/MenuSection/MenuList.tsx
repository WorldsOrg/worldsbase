import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import TableNameButton from "@/components/ui/table/TableNameButton";

interface MenuListProps {
  title: string;
  list: {
    name: string;
    link: string;
  }[];
}

import React from "react";

export default function MenuList({ title, list }: MenuListProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm uppercase text-titleColor">{title}</span>
      <div className="flex flex-col gap-1">
        {list.map((item) => (
          <Link href={item.link} key={uuidv4()}>
            <TableNameButton
              tableName={item.name}
              maxWidth={270}
              onClick={() => console.log("item.name", item.name)}
              selectedTable={""}
              className="p-1"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
