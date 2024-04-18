import React, { memo, useState } from "react";
import { Handle, useReactFlow, useStoreApi, Position } from "reactflow";

function Select({ value, handleId, nodeId, tables }: { value: any; handleId: any; nodeId: any; tables: any }) {
  const methods = ["insert", "update", "delete"];
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [values, setValue] = useState("wtf_users");
  const onChange = (evt: any) => {
    setValue(evt.target.value);
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id === nodeId) {
          node.data = {
            ...node.data,
            selects: {
              test: "testing",
              [handleId]: evt.target.value,
            },
          };
        }

        return node;
      })
    );
  };

  return (
    <div className="flex-grow mr-2">
      <div>Table</div>
      <select
        className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        onChange={onChange}
        value={values}
      >
        {tables.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div>Method</div>
      <select
        className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        onChange={onChange}
        value={values}
      >
        {methods.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Handle type="source" position={Position.Right} id={handleId} />
    </div>
  );
}

function CustomNode({ id, data }: { id: any; data: any }) {
  console.log(data);
  return (
    <>
      <div className="border border-gray-200 p-4 rounded bg-white w-80 flex flex-col">
        <div className="flex justify-between">
          <label htmlFor="text" className="block text-gray-500 text-md mb-2">
            Trigger node
          </label>
        </div>
        <Select key={1} nodeId={id} value={"asd"} handleId={1} tables={data.tables} />
      </div>
    </>
  );
}

export default memo(CustomNode);
