"use client";
import { ChangeEvent, useEffect, useState } from "react";
import _debounce from "lodash/debounce";
import { isEmpty } from "lodash";
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
import { PiSpinnerBold } from "react-icons/pi";
import IconInput from "../IconInput";
import SchemaOverlay from "./SchemaOverlay";

interface SchemaButtonProps {
  schemas: any[];
  schemasLoading: boolean;
  selectedSchema: string;
  handleSelectSchema: (schema: string) => void;
}

const SchemaButton = ({
  schemas,
  schemasLoading,
  selectedSchema,
  handleSelectSchema,
}: SchemaButtonProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const [searchedSchema, setSearchedSchema] = useState("");
  const [filteredSchemas, setFilteredSchemas] = useState(schemas);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setFilteredSchemas(schemas);
  }, [schemas]);

  const handleItemClicked = (schema: string) => {
    handleSelectSchema(schema);
    onClose();
  };

  const debouncedSearch = _debounce((value: string) => {
    const filteredData = schemas?.filter((item) =>
      item?.schema_name?.toLowerCase().includes(value.toLowerCase().trim())
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

  const handleOpenModal = () => {
    onClose();
    setOpenModal(true);
  };

  return (
    <>
      <PopoverUI isOpen={!schemasLoading && isOpen} onOpen={onOpen} onClose={onClose}>
        <PopoverTrigger>
          <button className="flex items-center w-full gap-2 px-3 py-2 border rounded-md border-primary text-primary bg-background hover:bg-hoverBg">
            <div className="flex items-center gap-1 text-xs">
              {schemasLoading ? (
                <div className="flex items-center gap-2">
                  <PiSpinnerBold className="w-4 h-4 animate-spin" />
                  <span>Loading schemas...</span>
                  </div>
              ) : (
                <>
                  <span className="text-gray-500 ">schema:</span>
                  <span className=" text-primary">{selectedSchema}</span>
                </>
              )}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="bg-background text-primary md:w-[197px] max-h-[292px] w-[280px] text-xs">
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
                    onClick={() => handleItemClicked(item?.schema_name)}
                  >
                    {item?.schema_name}
                    {item?.schema_name === selectedSchema ? (
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
            onClick={handleOpenModal}
          >
            <PlusIcon className="w-4 h-4 cursor-pointer text-primary" />
            <div>Create a new schema</div>
          </PopoverFooter>
        </PopoverContent>
      </PopoverUI>
      <SchemaOverlay open={openModal} setOpen={setOpenModal} />
    </>
  );
};

export default SchemaButton;
