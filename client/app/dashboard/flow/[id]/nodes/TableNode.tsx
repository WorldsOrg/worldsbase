import { useCallback, useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";
import FieldInput from "../FieldInput";

type FieldType = {
  id: number;
  label: string;
  value: string;
};

function TableNode({ data, isConnectable, id }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const [fields, setFields] = useState<FieldType[]>([{ id: Math.random(), label: "", value: "" }]);
  const [tableName, setTableName] = useState("");
  const [editing, setEditing] = useState(false);
  const [filters, setFilters] = useState({
    key: "",
    condition: "=",
    value: "",
  });
  const addField = () => {
    setFields([...fields, { id: Math.random(), label: "", value: "" }]);
  };

  useEffect(() => {
    if (data && data.fields) setFields(data.fields);

    if (data && data.tableName) setTableName(data.tableName);

    if (data && data.filters) setFilters(data.filters);
  }, [data]);

  const handleRemoveField = (id: number) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const onChange = useCallback((evt: { target: { value: string; id: string } }) => {
    setFilters((prev) => {
      return { ...prev, [evt.target.id]: evt.target.value };
    });
  }, []);

  const handleFieldChange = (id: number, field: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return { ...f, [field]: value };
        }
        return f;
      })
    );
  };

  const handleData = () => {
    if (editing) {
      setNodes(
        Array.from(nodeInternals.values()).map((node) => {
          if (node.id !== id) return node;
          node.data = {
            ...node.data,
            fields: fields,
            filters: filters,
          };
          return node;
        })
      );
    }
  };

  const handleTableName = (evt: any) => {
    setTableName(evt.target.value);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          tableName: evt.target.value,
        };
        return node;
      })
    );
  };

  return (
    <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col ${!editing && "bg-gray-200"}`}>
      <div className="flex justify-between">
        <label htmlFor="text" className="block text-gray-500 text-md mb-2">
          {data.label} Data - id:{id}
        </label>
        {data.label !== "Delete" && (
          <button
            onClick={addField}
            className="px-1 mb-2 py-1 text-sm w-1/2 text-gray-900 rounded-md shadow-sm bg-background ring-1 ring-inset ring-secondary hover:bg-gray-50 dark:text-primary dark:hover:text-secondary"
            disabled={!editing}
          >
            Add field
          </button>
        )}
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex-grow mr-2">
        <input
          type="text"
          name="key"
          id="key"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Table name"
          value={tableName}
          onChange={handleTableName}
          disabled={!editing}
        />
      </div>

      {data.label !== "Delete" && (
        <>
          {fields.map((field) => (
            <FieldInput
              editing={editing}
              key={field.id}
              label={field.label}
              id={field.id}
              handleFieldChange={handleFieldChange}
              handleRemoveField={handleRemoveField}
              value={field.value}
            />
          ))}
        </>
      )}

      {data.label !== "Insert" && (
        <>
          <div className="border-t border-gray-200 my-2 mt-4"></div>
          <label htmlFor="text" className="block text-gray-500 text-sm mt-2">
            Where
          </label>
          <div className="flex flex-row mt-2">
            <input
              placeholder="key"
              id="key"
              name="key"
              onChange={onChange}
              value={filters.key}
              className="nodrag mr-2 rounded w-28 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <input
              placeholder="equals"
              id="condition"
              name="equals"
              value={"="}
              onChange={onChange}
              className="nodrag mr-2 rounded w-12 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <input
              placeholder="value"
              id="value"
              name="value"
              value={filters.value}
              onChange={onChange}
              className="nodrag rounded w-28 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>{" "}
        </>
      )}

      <button
        type="button"
        onClick={() => {
          setEditing(!editing);
          handleData();
        }}
        className="mt-2 rounded-md bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
      >
        {editing ? "Save" : "Edit"}
      </button>
      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

type FieldInputProps = {
  id: number;
  handleFieldChange: (id: number, field: string, value: string) => void;
  handleRemoveField: (id: number) => void;
  value?: string;
  type?: string;
  editable?: boolean;
  editing?: boolean;
};

export default TableNode;
