import { useCallback, useState } from "react";
import { Handle, Position } from "reactflow";
import FieldInput from "./FieldInput";

type FieldType = {
  id: number;
  name: string;
  type: string;
  editing: boolean;
};

function TextUpdaterNode({ data, isConnectable }: { data: any; isConnectable: any }) {
  const [fields, setFields] = useState<FieldType[]>([{ id: Math.random(), name: "", type: "text", editing: false }]);

  const addField = () => {
    setFields([...fields, { id: Math.random(), name: "", type: "text", editing: false }]);
  };

  const handleRemoveField = (id: number) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const onChange = useCallback((evt: { target: { value: any } }) => {
    console.log(evt.target.value);
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

  return (
    <div className="border border-gray-200 p-4 rounded bg-white w-80 flex flex-col">
      <label htmlFor="text" className="block text-gray-500 text-md mb-2">
        {data.title} Data
      </label>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex-grow mr-2">
        <input
          type="text"
          name="key"
          id="key"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Table name"
          onChange={onChange}
        />
      </div>
      {data.title !== "Insert" && (
        <>
          {" "}
          <label htmlFor="text" className="block text-gray-500 text-sm mt-2">
            Where
          </label>
          <div className="flex flex-row mt-2">
            <input placeholder="key" id="text" name="text" onChange={onChange} className="nodrag mr-2 rounded w-28" />
            <input placeholder="equals" id="text" name="text" value={"="} onChange={onChange} className="nodrag mr-2 rounded w-12" />
            <input placeholder="value" id="text" name="text" onChange={onChange} className="nodrag rounded w-28" />
          </div>{" "}
        </>
      )}

      {data.title !== "Delete" && (
        <>
          {fields.map((field) => (
            <FieldInput
              key={field.id}
              id={field.id}
              handleFieldChange={handleFieldChange}
              handleRemoveField={handleRemoveField}
              editable={true}
              value={field.name}
              editing={field.editing}
            />
          ))}
          <button
            onClick={addField}
            className="px-3 mt-2 py-2 text-sm w-1/2 text-gray-900 rounded-md shadow-sm bg-background ring-1 ring-inset ring-secondary hover:bg-gray-50 dark:text-primary dark:hover:text-secondary"
          >
            Add field
          </button>
        </>
      )}

      <button type="button" className="mt-2 rounded-md bg-indigo-50 px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100">
        {data.title}
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

export default TextUpdaterNode;
