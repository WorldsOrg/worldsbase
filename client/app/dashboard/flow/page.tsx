"use client";

import { useEffect } from "react";
import { useTable } from "@/context/tableContext";
import Link from "next/link";

function WorkflowsPage() {
  const { fetchData, loadingData, data } = useTable();
  useEffect(() => {
    fetchData("workflow");
    console.log("WorkflowsPage");
  }, []);

  useEffect(() => {
    console.log("Data", data);
  }, [data]);

  const loadingSkaleton = [1, 2, 3, 4];

  return (
    <>
      <div>Workflow</div>
      {loadingData
        ? loadingSkaleton.map((item: any) => {
            return (
              <div className="border border-black rounded-md p-4 m-2 animate-pulse" key={item}>
                <div className="flex justify-between">
                  <div>
                    <h1 className="w-44 rounded-md bg-black">{item}</h1>
                    <h1 className="w-20 rounded-md mt-1 bg-black">{item}</h1>
                  </div>
                  <div>
                    <button className="bg-primary p-2 rounded-md m-1 text-white w-16 h-10"></button>{" "}
                    <button className="bg-primary p-2 rounded-md m-1 text-white w-16 h-10"></button>{" "}
                    <button className="bg-primary p-2 rounded-md m-1 text-white w-16 h-10"></button>
                    <button className="bg-primary p-2 rounded-md m-1 text-white w-16 h-10"></button>
                  </div>
                </div>
              </div>
            );
          })
        : data.map((item: any) => {
            return (
              <div className="border border-black rounded-md p-4 m-2" key={item.id}>
                <div className="flex justify-between">
                  <div>
                    <h1>{item.name}</h1>
                    <h1 className="w-20  mt-1 "> {item.deployed ? "Running" : "Idle"}</h1>
                  </div>
                  <div>
                    <button className="bg-primary p-2 rounded-md m-1 text-white">delete</button>
                    <button className="bg-primary p-2 rounded-md m-1 text-white">play</button>
                    <button className="bg-primary p-2 rounded-md m-1 text-white">stop</button>
                    <Link href={`/dashboard/flow/${item.id}`}>
                      <button className="bg-primary p-2 rounded-md m-1 text-white">edit</button>
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
