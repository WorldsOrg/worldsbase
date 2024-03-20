"use client";
import { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from "react";
import { usePathname,useRouter,useSearchParams} from "next/navigation";
import { textColumn, keyColumn } from "react-datasheet-grid";
import axios from "axios";
import _sortBy from "lodash/sortBy";
import { useToastContext } from "./toastContext";

interface TableContextProps {
  loading: boolean;
  fetchData: (table: string) => void;
  data: any[];
  columns: any[];
  loadingData: boolean;
  primaryColumn?: any;
  resetData: any[];
  setData: (data: any[]) => void;
  setSelectTable: (table: string) => void;
  selectedTable: string;
  navigation: Array<any>;
  deleteTableData: (tableName: string) => void;
  createTableData: (tableName: string, columns: { name: string; type: string; constraints: any }[]) => void;
  deleteColumnData: (tableName: string, columnName: string) => void;
  addColumnData: (tableName: string, columnName: string, columnType: string) => void;
  getTables: () => void;
  renameTable: (oldTableName: string, newTableName: string) => void;
  handleSelectTable: (tableName: string) => void;
}

export const TableContext = createContext<TableContextProps>({
  loading: false,
  fetchData: async (table: string) => {},
  data: [],
  columns: [],
  loadingData: false,
  primaryColumn: null,
  resetData: [],
  setData: (data: any[]) => {},
  setSelectTable: (table: string) => {},
  selectedTable: "",
  navigation: [],
  deleteTableData: (tableName: string) => {},
  createTableData: (tableName: string, columns: { name: string; type: string; constraints: any }[]) => {},
  deleteColumnData: (tableName: string, columnName: string) => {},
  addColumnData: (tableName: string, columnName: string, columnType: string) => {},
  getTables: () => {},
  renameTable: (oldTableName: string, newTableName: string) => {},
  handleSelectTable: (tableName: string) => {},
});

interface Navigation {
  table_name: string;
}

interface TableProviderProps {
  children: ReactNode;
}

export const TableProvider = ({ children }: TableProviderProps) => {
  // create axios instance with header
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY,
    },
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams=useSearchParams();

  const { toastAlert } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectTable] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [resetData, setResetData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [primaryColumn, setPrimaryColumn] = useState<any>(null);
  const [navigation, setNavigation] = useState<Array<Navigation>>([]);

  const fetchData = useCallback(
    async (tableName: string) => {
      setLoadingData(true);
      setPrimaryColumn(null);
      setColumns([]);
      setData([]);
      const { data, status } = await axiosInstance.get(`/table/gettable/${tableName}`);
      if (status !== 200) {
        console.error("Fething data error");
        toastAlert(false, "Fething data error");
        return;
      }
      const columnData = await axiosInstance.get(`/table/getcolumns/${tableName}`);

      if (columnData.status !== 200) {
        console.error("Fetching column names error");
        toastAlert(false, "Fetching column names error");
        return;
      }
      if (columnData.data && columnData.data.length > 0) {
        const primary = columnData.data.filter((item: any) => item.is_primary_key === true);
        if (primary.length > 0) {
          setPrimaryColumn(primary[0].column_name);
        }
        const col = columnData.data.map((item: any) => {
          if (item.is_primary_key) {
            return {
              ...keyColumn(item.column_name, textColumn),
              title: item.column_name,
              disabled: true,
            };
          }
          return {
            ...keyColumn(item.column_name, textColumn),
            title: item.column_name,
          };
        });

        setColumns(col);
      }
      if (data && data.length > 0) {
        setData(data);
        setResetData(data);
      }
      setLoadingData(false);
    },
    [setLoadingData, setPrimaryColumn, setColumns, toastAlert, setData, setResetData]
  );

  useEffect(() => {
    getTables();
  }, []);

  const getTables = useCallback(async () => {
    const { data, status } = await axiosInstance.get("/table/gettables/public");
    if (status === 200 && data) {
      const sortedData = _sortBy(data, ['table_name']);

      const params=searchParams.get("tableName");
      const tableName=params ?? sortedData[0].table_name

      setSelectTable(tableName);
      setNavigation(sortedData as Array<Navigation>);
    }
  }, []);

  const deleteTableData = useCallback(async (tableName: string) => {
    setLoading(true);
    const { status } = await axiosInstance.delete(`/table/deleteTable/${tableName}`);

    setLoading(false);
    if (status !== 200) {
      console.error("Deleting table error");
      toastAlert(false, "Deleting table error");
      return;
    }

    getTables();

    toastAlert(true, "Table deleted");
  }, []);

  const deleteColumnData = useCallback(async (tableName: string, columnName: string) => {
    setLoading(true);
    const { status } = await axiosInstance.delete(`/table/deleteColumn`, {
      data: { tableName, columnName },
    });

    setLoading(false);
    if (status !== 200) {
      console.error("Deleting column error");
      toastAlert(false, "Deleting column error");
      return;
    }
    toastAlert(true, "Column deleted");
    fetchData(tableName);
  }, []);

  const createTableData = useCallback(async (tableName: string, columns: { name: string; type: string; constraints: any }[]) => {
    const { status } = await axiosInstance.post(`/table/createTable`, {
      tableName,
      columns,
    });

    if (status !== 200) {
      toastAlert(false, "Error creating table");
    } else {
      toastAlert(true, "Table created successfully");
      await getTables();
      setSelectTable(tableName);
    }
  }, []);

  const addColumnData = useCallback(async (tableName: string, columnName: string, columnType: string) => {
    const { status } = await axiosInstance.post(`/table/addColumn`, {
      tableName,
      columnName,
      columnType,
    });

    if (status !== 200) {
      toastAlert(false, "Error adding column");
    } else {
      toastAlert(true, "Column added successfully");
      fetchData(tableName);
    }
  }, []);

  const renameTable = useCallback(async (oldTableName: string, newTableName: string) => {
    const { status } = await axiosInstance.put(`/table/updateTableName`, {
      oldTableName,
      newTableName,
    });

    if (status !== 200) {
      toastAlert(false, "Error updating table name");
    } else {
      toastAlert(true, "Table name updated successfully");
      fetchData(newTableName);
    }
  }, []);

  const handleSelectTable = useCallback((tableName: string) => {
    setSelectTable(tableName);
    router.push(`${pathname}/?tableName=${tableName}`)
  }, []);

  const value = useMemo(
    () => ({
      renameTable,
      loading,
      fetchData,
      data,
      columns,
      loadingData,
      primaryColumn,
      resetData,
      setData,
      setSelectTable,
      selectedTable,
      navigation,
      deleteTableData,
      createTableData,
      deleteColumnData,
      addColumnData,
      getTables,
      handleSelectTable
    }),
    [
      renameTable,
      loading,
      fetchData,
      data,
      columns,
      loadingData,
      primaryColumn,
      resetData,
      selectedTable,
      navigation,
      deleteTableData,
      createTableData,
      deleteColumnData,
      addColumnData,
      getTables,
      handleSelectTable
    ]
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

export const useTable = () => {
  return useContext(TableContext);
};
