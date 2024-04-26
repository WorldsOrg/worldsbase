"use client";

import { useEffect } from "react";
import { useTable } from "@/context/tableContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

function WorkflowsPage() {
  const { fetchData, loadingData, data } = useTable();

  const router = useRouter();
  useEffect(() => {
    fetchData("workflows");
  }, []);

  const loadingSkaleton = [1, 2, 3, 4];

  const handleDelete = (id: string) => {
    console.log("Delete", id);
  };

  const handlePlay = (id: string) => {
    console.log("Play", id);
  };

  const handleStop = (id: string) => {
    console.log("Stop", id);
  };

  const handleAdd = () => {
    const randomUUID = uuidv4();
    router.push(`/dashboard/flow/${randomUUID}`);
  };

  return (
    <>
      <div className="flex justify-between">
        {" "}
        <h1 className="text-xl">Workflows</h1>{" "}
        <button className="bg-primary p-2 rounded-md text-white" onClick={handleAdd}>
          Create
        </button>
      </div>

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
                    <button className="bg-primary p-2 rounded-md m-1 text-primary">delete</button>
                    <button className="bg-primary p-2 rounded-md m-1 text-primary">play</button>
                    <button className="bg-primary p-2 rounded-md m-1 text-primary">stop</button>
                    <button className="bg-primary p-2 rounded-md m-1 text-primary">edit</button>
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
                    <button className="bg-primary p-2 rounded-md m-1 text-white" onClick={() => handleDelete(item.id)}>
                      delete
                    </button>
                    <button className="bg-primary p-2 rounded-md m-1 text-white" onClick={() => handlePlay(item.id)}>
                      play
                    </button>
                    <button className="bg-primary p-2 rounded-md m-1 text-white" onClick={() => handleStop(item.id)}>
                      stop
                    </button>
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
