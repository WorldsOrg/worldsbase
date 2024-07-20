import { useTable } from "@/context/tableContext";
import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function MudWorldNode({ isConnectable, id, data }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const [worldValue, setWorldValue] = useState("");
  const [functionValue, setFunctionValue] = useState("");
  const [inputs, setInputs] = useState<any[]>([]);

  const [abi, setAbi] = useState<any[]>([]);
  const [functions, setFunctions] = useState<any[]>([]);

  const { fetchData, data: mudWorldsData, loadingData } = useTable();

  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(data.userId || "");
  }, [data]);

  useEffect(() => {
    fetchData("mud_worlds");
  }, [id]);

  useEffect(() => {
    if (!mudWorldsData || !mudWorldsData[0]) return;
    setWorldValue(mudWorldsData[0].id);
  }, [mudWorldsData]);

  useEffect(() => {
    if (!mudWorldsData || !worldValue) return;
    setAbi(mudWorldsData.find(({ id }) => id === worldValue).abi);
  }, [mudWorldsData, worldValue]);

  useEffect(() => {
    if (!abi) return;
    setFunctions(
      abi.filter(({ type }) => type === "function").map(({ name, inputs }) => ({ name, key: `${name}(${inputs.map(({ type }: { type: string }) => type).join(",")})`, inputs })),
    );
  }, [abi]);

  useEffect(() => {
    console.log(functions, functionValue);
    if (!functions || !functionValue) return;
    setInputs(functions.find(({ key }) => key === functionValue).inputs);
  }, [functionValue, functions]);

  const handleWorldChanged = (evt: any) => {
    setWorldValue(evt.target.value);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          world: evt.target.value,
        };
        return node;
      }),
    );
  };

  const handleFunctionChanged = (evt: any) => {
    setFunctionValue(evt.target.value);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          function: evt.target.value,
        };
        return node;
      }),
    );
  };

  const handleInputChanged = (name: string, value: string) => {
    const newInputs = inputs.map((input) => (name === input.name ? { ...input, value } : input));
    setInputs(newInputs);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          inputs: newInputs,
        };
        return node;
      }),
    );
  };

  const handleUserId = (evt: any) => {
    setUserId(evt.target.value);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          userId: evt.target.value,
        };
        return node;
      }),
    );
  };

  return (
    <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col bg-gray-200"`}>
      <div className="flex justify-between">
        <label htmlFor="text" className="block text-gray-500 text-md mb-2">
          Mud World Function - id:{id}
        </label>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      {loadingData && (
        <div className="flex flex-col justify-center gap-2 p-2 mb-2 md:flex-row border-borderColor text-primary ">
          <h1 className="mt-2 text-lg font-semibold whitespace-nowrap ">Loading...</h1>
        </div>
      )}
      <div>World</div>
      {mudWorldsData && (
        <select
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={handleWorldChanged}
          value={worldValue}
        >
          <option value="select" disabled>
            Select
          </option>
          {mudWorldsData.map((row: { name: string; id: string }) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      )}
      <div>Function</div>
      <div className="flex-grow mr-2">
        {functions && (
          <select
            className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleFunctionChanged}
            value={functionValue}
          >
            <option value="select" disabled>
              Select
            </option>
            {functions.map(({ name, key }) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-grow mr-2">
        <input
          type="text"
          name="key"
          id="key"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Caller User Id"
          value={userId}
          onChange={handleUserId}
        />
      </div>

      <div>Inputs</div>
      <div className="flex-grow mr-2">
        {inputs &&
          inputs.map(({ name, type, value }) => (
            <>
              <label htmlFor={name}>{name}</label>
              <input
                type="text"
                name={name}
                id={name}
                className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={type}
                value={value}
                onChange={(e) => handleInputChanged(name, e.target.value)}
              />
            </>
          ))}
      </div>

      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default MudWorldNode;
