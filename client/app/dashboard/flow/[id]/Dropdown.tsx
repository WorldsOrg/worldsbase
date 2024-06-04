import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, PencilSquareIcon, PlusIcon, ArrowRightStartOnRectangleIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import { WalletIcon } from "@heroicons/react/24/outline";
import { PiCoinThin, PiFunction } from "react-icons/pi";
import { BiTimer } from "react-icons/bi";
import { MdFunctions } from "react-icons/md";
import { FaEthereum } from "react-icons/fa";

export default function Dropdown({ handleAdd }: { handleAdd: (type: string) => void }) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          Add Node
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Trigger")}>
                <ArrowRightStartOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Trigger
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Cron")}>
                <BiTimer className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Cron
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Function")}>
                <PiFunction className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                DB Function
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Insert")}>
                <PlusIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Insert
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Wallet")}>
                <WalletIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Create Wallet
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("TransferPack")}>
                <WalletIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Transfer Pack
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("TopOffEth")}>
                <WalletIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Top Off Eth
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Token")}>
                <PiCoinThin className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Send Token
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("BatchMint")}>
                <FaEthereum className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Batch Mint
              </button>
            </Menu.Item>
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Update")}>
                <PencilSquareIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Update
              </button>
            </Menu.Item>
            {/* <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Delete")}>
                <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Delete
              </button>
            </Menu.Item> */}
            <Menu.Item>
              <button className={"text-gray-700 group flex items-center px-4 py-2 text-sm"} onClick={() => handleAdd("Note")}>
                <InformationCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                Add Note
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
