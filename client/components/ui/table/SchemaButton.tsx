"use client";
import { ChangeEvent, useState } from "react";
import _debounce from "lodash/debounce";
import {
  Popover as PopoverUI,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import IconInput from "../IconInput";
import { isEmpty } from "lodash";

interface PopoverProps {
  selectedSchema: string;
  handleSelectSchema: (schema: string) => void;
}

const schemas = [
  "auth",
  "extensions",
  "graphql",
  "net",
  "pgsodium",
  "pgsodium_masks",
  "public",
  "realtime",
  "storage",
  "supabase_functions",
  "vault",
];

const SchemaButton = ({ selectedSchema, handleSelectSchema }: PopoverProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [searchedSchema, setSearchedSchema] = useState("");
  const [filteredSchemas, setFilteredSchemas] = useState(schemas);

  const handleItemClicked = (schema: string) => {
    handleSelectSchema(schema);
    onClose();
  };

  const debouncedSearch = _debounce((value: string) => {
    const filteredData = schemas.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase().trim())
    );
    setFilteredSchemas(filteredData);
  }, 500);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchedSchema(value);
    debouncedSearch(value);
  };

  const clearSearchInput = () => {
    setSearchedSchema("");
    setFilteredSchemas(schemas);
  };

  return (
    <PopoverUI isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>
        <button className="flex items-center w-full gap-2 px-3 py-2 border rounded-md border-primary text-primary bg-background hover:bg-hoverBg">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-500 ">schema:</span>
            <span className=" text-primary">{selectedSchema}</span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-background text-primary w-[197px] max-h-[292px] text-xs">
        <IconInput
          type="string"
          icon={<MagnifyingGlassIcon className="w-4 h-4 text-primary" />}
          rightIcon={
            searchedSchema?.length > 0 ? (
              <XMarkIcon
                className="w-4 h-4 cursor-pointer text-primary"
                onClick={clearSearchInput}
              />
            ) : null
          }
          placeholder="Find schema..."
          value={searchedSchema}
          onChange={handleSearch}
          className="text-xs border-b rounded-none border-borderColor bg-background text-primary outline:none !focus:outline-none"
        />
        <PopoverBody className="px-0 py-1 overflow-auto scrollbar-class">
          <ul className="flex flex-col w-full gap-2">
            {isEmpty(filteredSchemas) ? (
              <div className="p-4 text-sm">No schemas found</div>
            ) : (
              filteredSchemas.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between w-full px-4 cursor-pointer h-7 hover:bg-hoverBg"
                  onClick={() => handleItemClicked(item)}
                >
                  {item}
                  {item === selectedSchema ? (
                    <CheckIcon className="w-4 text-green-800" />
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </PopoverBody>
        <PopoverFooter
          className="flex items-center gap-2 hover:bg-hoverBg"
          as="button"
        >
          <PlusIcon className="w-4 h-4 cursor-pointer text-primary" />
          <div>Create a new schema</div>
        </PopoverFooter>
      </PopoverContent>
    </PopoverUI>
  );
};

export default SchemaButton;
