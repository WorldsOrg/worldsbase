import { useTable } from "@/context/tableContext";
import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function TriggerNode({ data, id }: { data: any; id: any }) {
  const { columns, fetchData } = useTable();
  const methods = ["insert", "update", "delete"];

  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [tableValue, setTableValue] = useState();
  const [methodValue, setMethodValue] = useState();
  const [enabled, setEnabled] = useState(false);
  const [filter, setFilter] = useState({ column: "id", filter: "Equals", value: "" });
  const [keys, setKeys] = useState<Array<string>>([]);

  useEffect(() => {
    if (data && data.table) {
      setTableValue(data.table);
      fetchData(data.table);
    }

    if (data && data.method) {
      setMethodValue(data.method);
    }

    if (data && data.filter) {
      setEnabled(true);
      setFilter(data.filter);
    }
  }, [id]);

  useEffect(() => {
    if (columns) {
      const keys = columns.map((column) => column.title);

      setKeys(keys as string[]);
    }
  }, [columns]);

  const handleTableChange = (evt: any) => {
    fetchData(evt.target.value);
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
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          method: evt.target.value,
        };
        return node;
      })
    );
  };

  const handleFilterChange = (evt: any) => {
    setFilter({ ...filter, [evt.target.id]: evt.target.value });
    setNodes(
      Array.from(store.getState().nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          filter: { ...filter, [evt.target.id]: evt.target.value },
        };
        return node;
      })
    );
  };
  return (
    <>
      <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col`}>
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
              <option key={table.table_name}>{table.table_name}</option>
            ))}
          </select>
          <div className="mt-2">Method</div>
          <select
            className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleMethodChange}
            value={methodValue}
          >
            {methods.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <div className="flex h-6 items-center mt-2">
            <input
              id="comments"
              aria-describedby="comments-description"
              name="comments"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              onChange={(e) => setEnabled(e.target.checked)}
            />

            <div className="ml-3 text-sm leading-6">
              <label htmlFor="comments" className="font-medium text-gray-900">
                If Condition
              </label>{" "}
            </div>
          </div>
          {enabled && (
            <>
              <div className="flex flex-row mt-2">
                <select
                  id="column"
                  name="column"
                  className="nodrag mr-2 rounded w-28 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={filter.column}
                  onChange={handleFilterChange}
                >
                  {keys.map((key) => (
                    <option key={key}>{key}</option>
                  ))}
                </select>

                <select
                  id="filter"
                  name="filter"
                  className="nodrag mr-2 rounded w-12 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={filter.filter}
                  onChange={handleFilterChange}
                >
                  <option>Equals</option>
                  <option>Not Equals</option>
                  <option>Bigger</option>
                  <option>Smaller</option>
                </select>
                <input
                  placeholder="value"
                  id="value"
                  name="value"
                  value={filter.value}
                  onChange={handleFilterChange}
                  className="nodrag rounded w-24 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>{" "}
            </>
          )}
        </div>

        <Handle type="source" position={Position.Right} id="b" isConnectable={true} />
      </div>
    </>
  );
}

export default TriggerNode;
