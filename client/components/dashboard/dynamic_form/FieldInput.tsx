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

const FieldInput: React.FC<FieldInputProps> = memo(
  ({
    id,
    handleFieldChange,
    handleRemoveField,
    value,
    type,
    editable,
    editing,
  }) => {
    return (
      <div className="flex items-center mb-6">
        <div className="flex-grow mr-2">
          <label
            htmlFor="project-name"
            className="block text-sm font-medium leading-6 text-gray-900 dark:text-primary"
          >
            Column name
          </label>
          <input
            type="text"
            name="project-name"
            id="project-name"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Column Name"
            onChange={(e) => handleFieldChange(id, "name", e.target.value)}
            defaultValue={value || ""}
            disabled={!editable}
          />
        </div>
        {!editing && (
          <div className="flex-grow mr-2">
            <label
              htmlFor="project-name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Type
            </label>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => handleFieldChange(id, "type", e.target.value)}
              placeholder="Column Type"
              disabled={!editable}
              defaultValue={type || "text"}
            >
              {!editable && <option value="PRIMARY KEY">PRIMARY KEY</option>}
              <option value="text">Text</option>
              <option value="int">Int</option>
              <option value="float">Float</option>
              <option value="bool">Bool</option>
              <option value="date">Date</option>
              <option value="timestamp">Timestamp</option>
            </select>
          </div>
        )}

        {editable && (
          <button
            className="rounded text-primary hover:text-red-700 mt-7"
            onClick={() => handleRemoveField(id)}
          >
            <XMarkIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

FieldInput.displayName = "FieldInput";
export default FieldInput;
