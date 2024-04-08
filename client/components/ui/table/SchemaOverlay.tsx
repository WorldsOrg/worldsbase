import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { isEmpty } from "lodash";
import { useToastContext } from "@/context/toastContext";
import { PiSpinnerBold } from "react-icons/pi";
import { useTable } from "@/context/tableContext";

export default function SchemaOverlay({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
}) {
  const { toastAlert } = useToastContext();
  const { createSchema } = useTable();

  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (isEmpty(name)) {
      toastAlert(false, "Schema name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await createSchema(name);
    } finally {
      setName("");
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <div className="fixed inset-0 opacity-70 bg-hoverBg" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-screen max-w-md pointer-events-auto">
                  <div className="flex flex-col h-full shadow-xl bg-background">
                    <div className="flex-1 h-0 overflow-y-auto">
                      <div className="px-4 py-6 bg-secondary sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Create a new schema
                          </Dialog.Title>
                          <div className="flex items-center ml-3 h-7">
                            <button
                              type="button"
                              className="relative text-indigo-200 rounded-md bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="w-6 h-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="px-4 divide-y divide-gray-200 sm:px-6">
                          <div className="pt-6 pb-5 space-y-6">
                            <div className="flex-grow mb-4 mr-2">
                              <label
                                htmlFor="schema-name"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-primary"
                              >
                                Name
                              </label>
                              <input
                                type="text"
                                name="schema-name"
                                id="schema-name"
                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Name"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4">
                      <button
                        onClick={submit}
                        className={`flex items-center justify-center w-full gap-2 px-3 py-2 mb-6 text-sm text-white rounded-md ${
                          loading ? "bg-secondaryHover" : "bg-secondary"
                        } hover:bg-secondaryHover`}
                        disabled={false}
                      >
                        {loading && (
                          <PiSpinnerBold className="w-4 h-4 animate-spin" />
                        )}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
