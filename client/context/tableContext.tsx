"use client";
import { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter,useSearchParams} from "next/navigation";
import { textColumn, keyColumn } from "react-datasheet-grid";
import _sortBy from "lodash/sortBy";
import { useToastContext } from "./toastContext";
import axiosInstance from "../utils/axiosInstance";

interface TableContextProps {
  loading: boolean;
  fetchData: (table: string, page?: string) => void;
  data: any[];
  columns: any[];
  loadingData: boolean;
  primaryColumn?: any;
  resetData: any[];
  setData: (data: any[]) => void;
  setSelectTable: (table: string) => void;
  selectedTable: string;
  navigation: Array<any>;
  schemas:Array<any>;
  deleteTableData: (tableName: string) => void;
  createTableData: (tableName: string, columns: { name: string; type: string; constraints: any }[]) => Promise<any>;
  deleteColumnData: (tableName: string, columnName: string) => void;
  addColumnData: (tableName: string, columnName: string, columnType: string) => void;
  getTables: () => void;
  getSchemas: () => void;
  renameTable: (oldTableName: string, newTableName: string) => Promise<any>;
  handleSelectTable: (tableName: string) => void;
}

export const TableContext = createContext<TableContextProps>({
  loading: false,
  fetchData: async (table: string, page?: string) => {},
  data: [],
  columns: [],
  loadingData: false,
  primaryColumn: null,
  resetData: [],
  setData: (data: any[]) => {},
  setSelectTable: (table: string) => {},
  selectedTable: "",
  navigation: [],
  schemas:[],
  deleteTableData: (tableName: string) => {},
  createTableData: async(tableName: string, columns: { name: string; type: string; constraints: any }[]) => {
    return {
      showModal:false,
      title:"",
      message:""
    }
  } ,
  deleteColumnData: (tableName: string, columnName: string) => {},
  addColumnData: (tableName: string, columnName: string, columnType: string) => {},
  getTables: () => {},
  getSchemas: () => {},
  renameTable: async(oldTableName: string, newTableName: string) => {
    return {
      showModal:false,
      title:"",
      message:""
    }
  },
  handleSelectTable: (tableName: string) => {},
});

interface Navigation {
  table_name: string;
}

interface Schema {
  schema_name: string;
}

interface TableProviderProps {
  children: ReactNode;
}

export const TableProvider = ({ children }: TableProviderProps) => {

  const router = useRouter();
  const path="/dashboard/table_editor"
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
  const [schemas, setSchemas] = useState<Array<Schema>>([]);

  const fetchData = useCallback(
    async (tableName: string,page?:string) => {
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
        if (page === "tableEditor") {
          router.push(`${path}/?tableName=${tableName}`);
        }
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
    const fetchData = async () => {
        await Promise.all([getTables(), getSchemas()]);
    };

    fetchData();
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

  const getSchemas = useCallback(async () => {
    const { data, status } = await axiosInstance.get("/table/getschemas");
    if (status === 200 && data) {
       const sortedData = _sortBy(data, ['schema_name']);
      setSchemas(sortedData as Array<Schema>);
    }
  }, []);


  const deleteTableData = useCallback(async (tableName: string) => {
        setLoading(true);
    try {
    const { status } = await axiosInstance.delete(`/table/deletetable/${tableName}`,);
    if (status !== 200) {
      console.error("Deleting table error");
      toastAlert(false, "Deleting table error");
      return;
    }

    getTables();
    toastAlert(true, "Table deleted");
  } finally  {
    setLoading(false);
  }
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
    await fetchData(tableName);
  }, []);

  const checkIsTableNameValid = useCallback(async (tableName: string) => {
    const { data} = await axiosInstance.get("/table/defaulttables");

    const isTableNameValid=data.find((item: string)=>item === tableName.toLowerCase().trim())
    return Boolean(isTableNameValid);
  }, []);

  const createTableData = useCallback(async (tableName: string, columns: { name: string; type: string; constraints: any }[]) => {

    const isTableNameExists=await checkIsTableNameValid(tableName);
    if(isTableNameExists){
      return {
        showModal:true,
        title:"Error",
        message:`"${tableName}" table name can not be used.`,
      };
    }
    
    const { status } = await axiosInstance.post(`/table/createTable`, {
      tableName,
      columns,
    });
    
    if (status !== 200) {
      toastAlert(false, "Error creating table");
      return {
        showModal:false,
        title:"",
        message:"",
      };
    } else {
      toastAlert(true, "Table created successfully");
      await getTables();
      setSelectTable(tableName);
      return {
        showModal:false,
        title:"",
        message:"",
      };
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
      await fetchData(tableName);
    }
  }, []);

  const renameTable = useCallback(async (oldTableName: string, newTableName: string) => {

    const isTableNameExists=await checkIsTableNameValid(newTableName);
    if(isTableNameExists){
      return {
        showModal:true,
        title:"Error",
        message:`"${newTableName}" table name can not be used.`,
      };
    }

    const { status } = await axiosInstance.put(`/table/updatetablename`, {
      oldTableName,
      newTableName,
    });

    if (status !== 200) {
      toastAlert(false, "Error updating table name");
      return {
        showModal:false,
        title:"",
        message:"",
      };

    } else {
      toastAlert(true, "Table name updated successfully");
      setSelectTable(newTableName);
      await fetchData(newTableName);
      return {
        showModal:false,
        title:"",
        message:"",
      };
    }
  }, []);

  const handleSelectTable = useCallback((tableName: string) => {
    setSelectTable(tableName);
    router.push(`${path}/?tableName=${tableName}`)
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
      schemas,
      deleteTableData,
      createTableData,
      deleteColumnData,
      addColumnData,
      getTables,
      getSchemas,
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
      schemas,
      deleteTableData,
      createTableData,
      deleteColumnData,
      addColumnData,
      getTables,
      getSchemas,
      handleSelectTable
    ]
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};

export const useTable = () => {
  return useContext(TableContext);
};
