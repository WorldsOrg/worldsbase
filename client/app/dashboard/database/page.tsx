"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Table from "@/components/dashboard/databasePage/Table";
import IconInput from "@/components/ui/IconInput";
import SchemaButton from "@/components/ui/table/SchemaButton";
import { useTable } from "@/context/tableContext";

export default function Database() {
  const { schemas, schemasLoading, selectedSchema, handleSelectSchema } =
    useTable();

  return (
    <div className="flex flex-col w-full gap-4 text-white ">
      <span className="mb-2 text-xl">{`Database `}</span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-max">
          <div className="w-64">
            <SchemaButton
              schemas={schemas}
              schemasLoading={schemasLoading}
              selectedSchema={selectedSchema}
              handleSelectSchema={handleSelectSchema}
              dropdownClass="!w-64"
            />
          </div>
          <div className="w-64">
            <IconInput
              type="string"
              icon={<MagnifyingGlassIcon className="w-4 h-4 text-primary" />}
              rightIcon={
                <XMarkIcon
                  className="w-4 h-4 cursor-pointer text-primary"
                  onClick={() => {}}
                />
              }
              placeholder="Search for a function"
              value={""}
              onChange={() => {}}
              className="text-xs bg-background text-primary"
            />
          </div>
        </div>

        <button
          className="px-3 py-2 text-sm text-white rounded-md bg-secondary hover:bg-secondaryHover"
          onClick={() => {}}
        >
          Create a new function
        </button>
      </div>
      <Table />
    </div>
  );
}
