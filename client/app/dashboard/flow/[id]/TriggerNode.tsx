import { useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function TriggerNode({ data, id }: { data: any; id: any }) {
  const methods = ["insert", "update", "delete"];

  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [tableValue, setTableValue] = useState("wtf_users");
  const [methodValue, setMethodValue] = useState("insert");

  const handleTableChange = (evt: any) => {
    setTableValue(evt.target.value);
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        node.data = {
          ...node.data,
          table: evt.target.value,
        };
        return node;
      })
    );
  };

  const handleMethodChange = (evt: any) => {
    setMethodValue(evt.target.value);
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        node.data = {
          ...node.data,
          method: evt.target.value,
        };
        return node;
      })
    );
  };
  return (
    <>
      <div className="border border-gray-200 p-4 rounded bg-white w-80 flex flex-col">
        <div className="flex justify-between">
          <label htmlFor="text" className="block text-gray-500 text-md mb-2">
            Trigger Node - id:{id}
          </label>
        </div>

        <div className="flex-grow mr-2">
          <div>Table</div>
          <select
            className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleTableChange}
            value={tableValue}
          >
            {data.tables.map((table: { table_name: string }) => (
              <option key={table.table_name} value={table.table_name}>
                {table.table_name}
              </option>
            ))}
          </select>
          <div className="mt-2">Method</div>
          <select
            className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleMethodChange}
            value={methodValue}
          >
            {methods.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="mt-2 rounded-md bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
          Test
        </button>
        <Handle type="source" position={Position.Right} id="b" isConnectable={true} />
      </div>
    </>
  );
}

export default TriggerNode;
