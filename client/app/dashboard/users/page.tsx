"use client";
import { useEffect, useState } from "react";
import { DataSheetGrid, keyColumn, textColumn } from "react-datasheet-grid";
import "react-datasheet-grid/dist/style.css";
import { TbEditOff } from "react-icons/tb";
import axiosInstance from "@/utils/axiosInstance";

export default function Apps() {
  const columns = [
    { ...keyColumn("steam_username", textColumn), title: "Steam Username" },
    { ...keyColumn("wallet", textColumn), title: "Wallet" },
  ];

  const [viewportHeight, setViewportHeight] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const { data } = await axiosInstance.get("table/getTable/monster_players");
    if (data) {
      setData(data);
    }
  };

  useEffect(() => {
    // Function to update the height of grid
    const updateHeight = () => {
      // first check if container is present
      const container = window.document.getElementById("dataSheetGridContainer");

      if (container) {
        // get the offset of container from top of page
        const offsetTop = container.getBoundingClientRect().top;

        // set additional offset to account for the "add row" part of grid
        const offsetForAddRow = 90;

        // calculate height of grid from window height minus offsets
        const heightToSet = window.innerHeight - offsetTop - offsetForAddRow;

        setViewportHeight(heightToSet);
      }
    };

    if (typeof window !== "undefined") {
      updateHeight();
      window.addEventListener("resize", updateHeight);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateHeight);
      }
    };
  }, []);

  return (
    <>
      {columns && (
        <>
          <div className="flex justify-between gap-2 p-2 mb-2 border text-primary ">
            <div className="mt-2 text-xl font-semibold ">Users</div>
            <div className="flex gap-2"></div>
          </div>
          <div className="flex gap-2 p-2 mb-2 border ">
            {
              <button className="flex gap-2 px-6 py-2 border bg-background border-grey-100 dark:text-primary hover:border-gray-300">
                <span className="pt-0.5">
                  <TbEditOff />
                </span>
                Read only table
              </button>
            }
          </div>
          <div id="dataSheetGridContainer">
            <DataSheetGrid addRowsComponent={false} value={data} onChange={setData} columns={columns} height={viewportHeight} />
          </div>
        </>
      )}
    </>
  );
}
