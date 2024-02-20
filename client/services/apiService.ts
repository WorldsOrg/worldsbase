// services/apiService.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_X_API_KEY,
  },
});

export const createData = async (tableName: string, data: any) => axiosInstance.post("/table/insertData", { tableName, data });

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
