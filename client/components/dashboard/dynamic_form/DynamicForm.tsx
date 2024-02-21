import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { CgSpinner } from "react-icons/cg";
import { useToast } from "@chakra-ui/react";
import { useTable } from "@/context/tableContext";
import FieldInput from "./FieldInput";

type FieldType = {
  id: number;
  name: string;
  type: string;
  editing: boolean;
};

type Column = {
  id: string | number;
  name: string;
  type?: string;
  editing?: boolean;
  columnData?: any;
  title?: string;
  disabled?: boolean;
};

interface DynamicFormProps {
  closeLayout: () => void;
  columns: any[];
  editing: boolean;
  selectedTable: string;
}

const DynamicForm = ({ closeLayout, columns, editing, selectedTable }: DynamicFormProps) => {
  const { createTableData, addColumnData, deleteColumnData, setSelectTable, renameTable } = useTable();
  const [fields, setFields] = useState<FieldType[]>([{ id: Math.random(), name: "", type: "text", editing: false }]);
  const [tableName, setTableName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  const handleToast = (message: string, status: "loading" | "info" | "warning" | "success" | "error" | undefined) => {
    toast({
      title: message,
      status,
      position: "top",
      duration: 2000,
    });
  };

  useEffect(() => {
    if (editing) {
      const newFields = columns.map((c) => {
        return { id: c.id, name: c.id, type: "text", editing: true };
      });
      setFields(newFields);
      setTableName(selectedTable);
    }
  }, [editing]);

  const addField = () => {
    setFields([...fields, { id: Math.random(), name: "", type: "text", editing: false }]);
  };

  const handleRemoveField = (id: number) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleFieldChange = (id: number, field: string, value: string) => {
    const newFields = fields.map((f) => {
      if (f.id === id) {
        return { ...f, [field]: value };
      }
      return f;
    });
    setFields(newFields);
  };

  const resetForm = async () => {
    setLoading(false);
    closeLayout();
    setTableName("");
    setSelectTable(tableName);
    setFields([{ id: Math.random(), name: "", type: "text", editing: false }]);
  };

  function compareColumns(oldColumns: Column[], newColumns: Column[]) {
    const addedColumns = newColumns.filter((nc) => !oldColumns.some((oc) => oc.id === nc.id));
    const deletedColumns = oldColumns.filter((oc) => !newColumns.some((nc) => nc.id === oc.id));
    // const renamedColumns = oldColumns
    //   .filter((oc) => newColumns.some((nc) => nc.id !== oc.id))
    //   .map((oc) => {
    //     return {
    //       oldName: oc.id,
    //       newName: newColumns.find((nc) => nc.id !== oc.id),
    //     };
    //   });
    // console.log("Renamed Columns:", renamedColumns);

    if (addedColumns.length > 0) {
      addedColumns.forEach((c) => {
        addColumn(selectedTable, c.name as string, c.type || "text");
      });
    }
    if (deletedColumns.length > 0) {
      deletedColumns.forEach((c) => {
        deleteColumn(selectedTable, c.id as string);
      });
    }
  }

  const addColumn = async (table: string, column: string, type: string) => {
    addColumnData(table, column, type);
    resetForm();
  };

  const deleteColumn = async (table: string, column: string) => {
    deleteColumnData(table, column);
    resetForm();
  };

  const saveForm = async () => {
    setLoading(true);
    if (editing) {
      if (tableName !== selectedTable) {
        renameTable(selectedTable, tableName);
      }
      compareColumns(columns, fields);

      // await supabase.rpc("rename_column", {
      //   table_name: "test_table_2",
      //   old_column_name: "username",
      //   new_column_name: "updated_username",
      // });
    } else {
      const columnsWithIdRemoved = fields.map(({ id, ...rest }) => rest);

      const handleEmptyFieldError = (fieldName: string) => {
        handleToast(`${fieldName} name cannot be empty.`, "error");
        setLoading(false);
        return;
      };

      if (isEmpty(tableName?.trim())) {
        handleEmptyFieldError("Table");
      } else if (columnsWithIdRemoved.some((column) => !column.name.trim())) {
        handleEmptyFieldError("Column");
      } else {
        const columns = [{ name: "id", type: "serial", constraints: "PRIMARY KEY" }, ...columnsWithIdRemoved];

        createTableData(tableName, columns as { name: string; type: string; constraints: any }[]);

        setLoading(false);
        closeLayout();
        setTableName("");
        setFields([{ id: Math.random(), name: "", type: "text", editing: false }]);
      }
    }
  };

  return (
    <>
      <div className="container mx-auto">
        <div className="flex-grow mb-4 mr-2">
          <label htmlFor="table-name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-primary">
            Table name
          </label>
          <input
            type="text"
            name="table-name"
            id="table-name"
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Table Name"
            onChange={(e) => setTableName(e.target.value)}
            value={tableName}
          />
        </div>
        {!editing && <FieldInput key={"id"} id={1} handleFieldChange={handleFieldChange} handleRemoveField={handleRemoveField} value="id" type="PRIMARY KEY" editable={false} />}

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
          className="px-3 py-2 text-sm text-gray-900 rounded-md shadow-sm bg-background ring-1 ring-inset ring-secondary hover:bg-gray-50 dark:text-primary dark:hover:text-secondary"
        >
          Add column
        </button>
      </div>
      <button
        onClick={saveForm}
        className={"w-full rounded-md bg-secondary px-3 py-2 text-sm text-white shadow-sm hover:text-black ring-1 ring-inset ring-secondary hover:bg-gray-50"}
        disabled={loading}
      >
        {loading ? (
          <>
            <CgSpinner className="mx-auto text-xl animate-spin" />
          </>
        ) : editing ? (
          "Save"
        ) : (
          "Create"
        )}
      </button>
    </>
  );
};

export default DynamicForm;
