"use client";

import { useEffect } from "react";
import { useTable } from "@/context/tableContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { deleteData } from "@/services/apiService";
import axiosInstance from "@/utils/axiosInstance";

function WorkflowsPage() {
  const { fetchData, loadingData, data } = useTable();

  const router = useRouter();
  useEffect(() => {
    fetchData("workflows");
  }, []);

  const loadingSkaleton = [1, 2, 3, 4];

  const handleDelete = async (
    id: string | number,
    shortId: string | number,
    tableName: string
  ) => {
    await Promise.all([
      deleteData("workflows", { id }, "id"),
      axiosInstance.delete(`/table/removetrigger`, { data: { shortId, tableName }})
    ]);
    fetchData("workflows");
  };

  const handleAdd = () => {
    const randomUUID = uuidv4();
    router.push(`/dashboard/flow/${randomUUID}`);
  };

  return (
    <>
      <div className="flex justify-between">
        {" "}
        <h1 className="text-xl text-primary">Workflows</h1>{" "}
        <button className="p-2 text-white rounded-md dark:text-black bg-primary" onClick={handleAdd}>
          Create
        </button>
      </div>

      {loadingData
        ? loadingSkaleton.map((item: any) => {
            return (
              <div className="p-4 m-2 border border-black rounded-md animate-pulse" key={uuidv4()}>
                <div className="flex justify-between">
                  <div>
                    <h1 className="bg-black rounded-md w-44">{item}</h1>
                    <h1 className="w-20 mt-1 bg-black rounded-md">{item}</h1>
                  </div>
                  <div>
                    <button className="p-2 m-1 rounded-md bg-primary text-primary">Delete</button>

                    <button className="p-2 m-1 rounded-md bg-primary text-primary">Edit</button>
                  </div>
                </div>
              </div>
            );
          })
        : data.map((item: any) => {
            return (
              <div className="p-4 m-2 border border-black rounded-md" key={item.id}>
                <div className="flex justify-between">
                  <div className="text-primary">
                    <h1>{item.name}</h1>
                    <h1 className="mt-1 w-50 "> executed : {item.execution_count}</h1>
                  </div>
                  <div className="text-white dark:text-black">
                    <button className="p-2 m-1 rounded-md bg-primary" onClick={() => handleDelete(item?.id, item?.short_id, item?.table_name)}>
                      Delete
                    </button>

                    <Link href={`/dashboard/flow/${item.id}`}>
                      <button className="p-2 m-1 rounded-md bg-primary">Edit</button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
    </>
  );
}

export default WorkflowsPage;
