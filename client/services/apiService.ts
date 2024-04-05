// services/apiService.js
import axiosInstance from "../utils/axiosInstance";

export const createData = async (tableName: string, data: any) => axiosInstance.post("/table/insertdata", { tableName, data });

export const updateData = async (tableName: string, data: { [x: string]: any }, primaryColumn: string | number) =>
  axiosInstance.put("/table/updateData", {
    tableName,
    data,
    condition: `${primaryColumn} = ${data[primaryColumn]}`,
  });

export const deleteData = async (tableName: string, data: { [x: string]: any }, primaryColumn: string | number) =>
  axiosInstance.delete("/table/deleteData", {
    data: {
      tableName,
      condition: `${primaryColumn} = ${data[primaryColumn]}`,
    },
  });
