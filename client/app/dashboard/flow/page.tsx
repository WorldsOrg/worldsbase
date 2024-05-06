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
                    <button className="p-2 m-1 rounded-md bg-primary text-primary">delete</button>
                    <button className="p-2 m-1 rounded-md bg-primary text-primary">play</button>
                    <button className="p-2 m-1 rounded-md bg-primary text-primary">stop</button>
                    <button className="p-2 m-1 rounded-md bg-primary text-primary">edit</button>
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
                    <h1 className="w-20 mt-1 "> {item.deployed ? "Running" : "Idle"}</h1>
                  </div>
                  <div className="text-white dark:text-black">
                    <button className="p-2 m-1 rounded-md bg-primary" onClick={() => handleDelete(item.id)}>
                      delete
                    </button>
                    <button className="p-2 m-1 rounded-md bg-primary" onClick={() => handlePlay(item.id)}>
                      play
                    </button>
                    <button className="p-2 m-1 rounded-md bg-primary" onClick={() => handleStop(item.id)}>
                      stop
                    </button>
                    <Link href={`/dashboard/flow/${item.id}`}>
                      <button className="p-2 m-1 rounded-md bg-primary">edit</button>
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
