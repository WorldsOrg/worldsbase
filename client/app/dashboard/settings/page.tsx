"use client";
import { Key, useEffect, useState } from "react";
import { Tooltip } from "@chakra-ui/react";
import { BiShow, BiHide } from "react-icons/bi";
import { FaCopy } from "react-icons/fa";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { supabase } from "@/utils/supabaseClient";
import { CgSpinner } from "react-icons/cg";
import { useTable } from "@/context/tableContext";

type ShowState = {
  apiKey: boolean;
  password: boolean;
};

export default function Settings() {
  const { navigation } = useTable();
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY as string;

  const [triggerForm, setTriggerForm] = useState<any>([
    {
      table: "",
      trigger: "",
    },
  ]);
  const [show, setShow] = useState<ShowState>({
    apiKey: false,
    password: false,
  });
  const [loading, setLoading] = useState({
    creds: false,
    trigger: false,
  });
  const { copyToClipboard } = useCopyToClipboard();

  const loadCreds = async () => {
    if (!apiKey) return;

    const { data, error } = await supabase.from("triggers").select("*").eq("id", 1).single();
    if (!error) {
      data.triggers.length > 0 && setTriggerForm(data.triggers);
    }
  };

  useEffect(() => {
    loadCreds();
  }, []);

  const handleTriggerChange = (e: React.ChangeEvent<HTMLInputElement>, index: any) => {
    const { name, value } = e.target;

    setTriggerForm((prev: any) => {
      const temp = [...prev];
      temp[index][name] = value;
      return temp;
    });
  };

  const handleChangeVisibility = (key: keyof ShowState) => () => {
    setShow((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateTrigger = async () => {
    setLoading(() => ({ creds: false, trigger: true }));
    if (!apiKey) return;

    const { data, error } = await supabase.from("api_keys").update({ triggers: triggerForm }).eq("x_api_key", apiKey);
    if (!error) {
      loadCreds();
    }
    setLoading(() => ({ creds: false, trigger: false }));
  };

  const addNewForm = () => {
    setTriggerForm((prev: any) => [
      ...prev,
      {
        table: "",
        trigger: "",
      },
    ]);
  };

  const InputIcons = ({ stateKey, value }: { stateKey: keyof ShowState; value: string | number }) => {
    return (
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3 text-sm text-contrastBg">
        <button type="button" onClick={handleChangeVisibility(stateKey)}>
          {show[stateKey] ? <BiHide /> : <BiShow />}
        </button>
        <Tooltip label="Copy to Clipboard" className=" bg-background text-primary">
          <button type="button" onClick={() => copyToClipboard(value.toString())}>
            <FaCopy />
          </button>
        </Tooltip>
      </div>
    );
  };

  return (
    <>
      <div className="max-w-sm p-4 pt-12 mx-auto border-2 rounded-md border-borderColor">
        <div className="mb-4">
          <label htmlFor="api-key" className="block text-sm font-medium text-primary">
            API Key
          </label>
          <div className="relative flex items-center w-full">
            <input
              type={show.apiKey ? "text" : "password"}
              id="api-key"
              className="block w-full pr-10 mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={apiKey}
              readOnly
            />
            <InputIcons stateKey="apiKey" value={apiKey} />
          </div>
        </div>
      </div>

      <div className="max-w-sm p-4 mt-4 pt-12 mx-auto border-2 rounded-md border-borderColor">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label htmlFor="api-key" className="block text-sm font-medium text-primary">
              Trigger action
            </label>
            <button onClick={addNewForm} className="rounded-md bg-secondary px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-secondary hover:bg-secondaryHover">
              Add new
            </button>
          </div>

          {triggerForm.map((trigger: { table: string; trigger: string }, index: Key | null | undefined) => (
            <div key={index}>
              <div className="relative flex items-center w-full mt-4">
                <select
                  id="table"
                  name="table"
                  autoComplete="table-name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  onChange={(e) => handleTriggerChange(e as any, index)}
                  value={trigger.table}
                >
                  {navigation &&
                    navigation.map((item) => (
                      <option key={item.table_name} value={item.table_name}>
                        {item.table_name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="relative flex items-center w-full">
                <input
                  type={"text"}
                  name={"trigger"}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={trigger.trigger}
                  onChange={(e) => handleTriggerChange(e as any, index)}
                />
              </div>
            </div>
          ))}
          {
            <button
              onClick={updateTrigger}
              className={"w-full mt-6 rounded-md bg-secondary px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-secondary hover:bg-secondaryHover"}
              disabled={loading.trigger}
            >
              {loading.trigger ? (
                <>
                  <CgSpinner className="mx-auto text-xl animate-spin" />
                </>
              ) : (
                "Save"
              )}
            </button>
          }
        </div>
      </div>
    </>
  );
}
