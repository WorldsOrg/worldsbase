import { memo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type FieldInputProps = {
  id: number;
  handleFieldChange: (id: number, field: string, value: string) => void;
  handleRemoveField: (id: number) => void;
  value?: string;
  type?: string;
  editable?: boolean;
  editing?: boolean;
};

const FieldInput: React.FC<FieldInputProps> = memo(({ id, handleFieldChange, handleRemoveField, value, type, editable, editing }) => {
  return (
    <div className="flex items-center">
      <div className="flex-grow mr-2">
        <input
          type="text"
          name="key"
          id="key"
          className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Key"
          onChange={(e) => handleFieldChange(id, "key", e.target.value)}
          defaultValue={value || ""}
          disabled={!editable}
        />
      </div>
      {!editing && (
        <div className="flex-grow mr-2">
          <input
            type="text"
            name="value"
            id="value"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Value"
            onChange={(e) => handleFieldChange(id, "name", e.target.value)}
            defaultValue={value || ""}
            disabled={!editable}
          />
        </div>
      )}

      {editable && (
        <button className="rounded text-primary hover:text-red-700 " onClick={() => handleRemoveField(id)}>
          <XMarkIcon className="w-6 h-6 mt-2" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

FieldInput.displayName = "FieldInput";
export default FieldInput;
