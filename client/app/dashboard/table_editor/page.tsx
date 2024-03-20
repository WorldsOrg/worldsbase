"use client";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { DataSheetGrid } from "react-datasheet-grid";
import "react-datasheet-grid/dist/style.css";
import AppLayout from "@/components/dashboard/app_layout/AppLayout";
import { AiFillAlipayCircle, AiOutlineDelete, AiOutlineEdit, AiOutlineReload, AiOutlineSave, AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { RxReset } from "react-icons/rx";
import { TbEditOff } from "react-icons/tb";
import OverlayForm from "@/components/dashboard/overlay_form/OverlayForm";
import DeletePrompt from "@/components/dashboard/delete_prompt/DeletePrompt";
import { CgSpinner } from "react-icons/cg";
import { useTable } from "@/context/tableContext";
import Button from "@/components/ui/table/Button";
import { createData, updateData, deleteData } from "@/services/apiService";
import { sortByKey, compareArrays } from "@/utils/dataUtils";

export default function Apps() {
  const { fetchData, data, columns, loadingData, primaryColumn, resetData, setData, setSelectTable, selectedTable, deleteTableData, loading } = useTable();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<any>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleToast = (message: string) => {
    toast({
      position: "top",
      duration: 2000,
      render: () => <div className="bg-[#556483] text-white p-3 rounded-md">{message}</div>,
    });
  };

  useEffect(() => {
    if (selectedTable) {
      fetchData(selectedTable);
    }
  }, [selectedTable]);

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

  const handleReset = () => {
    setData(resetData);
  };

  const handleSave = async () => {
    const result = compareArrays(primaryColumn, resetData, data);

    if (result.created.length === 0 && result.updated.length === 0 && result.deleted.length === 0) {
      return;
    }

    await Promise.all([
      ...result.created.map((item) => handleCreate(item)),
      ...result.updated.map((item) => handleUpdate(item)),
      ...result.deleted.map((item) => handleDelete(item)),
    ]);

    fetchData(selectedTable);
  };

  const handleCreate = async (data: any) => {
    try {
      const { status } = await createData(selectedTable, data);
      if (status === 200) {
        handleToast("Data inserted");
      } else {
        handleToast("Error inserting data");
      }
    } catch (error) {
      handleToast("Error inserting data");
      console.error("Error inserting data", error);
    }
  };

  const handleUpdate = async (data: any) => {
    const { status } = await updateData(selectedTable, data, primaryColumn);
    if (status !== 200) {
      handleToast("Error updating data:");
      console.error("Error updating data");
    } else {
      handleToast("Data updated");
    }
  };

  const handleDelete = async (data: any) => {
    const { status } = await deleteData(selectedTable, data, primaryColumn);

    if (status !== 200) {
      handleToast("Error deleting data");
      console.error("Error deleting data");
    } else {
      handleToast("Data deleted");
    }
  };

  const deleteTable = async () => {
    deleteTableData(selectedTable);
    setOpenDelete(false);
  };

  const handleDeleteTable = () => {
    setOpenDelete(true);
  };

  const genId = () => {
    let randomNumber: number;
    do {
      randomNumber = Math.floor(Math.random() * 1000);
    } while (data.some((item) => item.id === randomNumber));
    return randomNumber;
  };

  const [sortOrder, setSortOrder] = useState("asc");
  const [sortLoading, setSortLoading] = useState(false);
  const [orderKey, setOrderKey] = useState("id" as string);
  const changeOrder = (key: string, order: string) => {
    setSortLoading(true);
    const sortedData = sortByKey(data, key, order);
    setData(sortedData);
    setTimeout(() => {
      setSortLoading(false);
    }, 100);
  };

  useEffect(() => {
    changeOrder(orderKey, sortOrder);
  }, [sortOrder]);

  const [keyword, setKeyword] = useState("");

  const searchByKeyword = useCallback(
    (keyword: string) => {
      if (keyword.length === 0) {
        setData(resetData);
        return;
      }

      setSortLoading(true);
      const lowerCaseKeyword = keyword.toLowerCase();
      const results = data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(lowerCaseKeyword)));

      setData(results);
      setTimeout(() => setSortLoading(false), 100);
    },
    [resetData]
  );

  useEffect(() => {
    searchByKeyword(keyword);
  }, [keyword]);

  const handleAddNewTableClicked = () => {
    setEditing(false);
    setOpen(true);
  }

  return (
    <AppLayout addNewTableClicked={handleAddNewTableClicked}>
      <DeletePrompt open={openDelete} setOpen={setOpenDelete} approveDelete={deleteTable} />
      <OverlayForm open={open} setOpen={setOpen} selectTable={setSelectTable} columns={columns} editing={editing} selectedTable={selectedTable} />

      {loadingData && (
        <div className="flex flex-col justify-center gap-2 p-2 mb-2 md:flex-row border-borderColor text-primary ">
          <h1 className="mt-2 text-lg font-semibold whitespace-nowrap ">Loading...</h1>
        </div>
      )}
      {columns && !loadingData && (
        <>
          <div className="flex flex-col justify-between gap-2 p-2 mb-2 border md:flex-row border-borderColor text-primary ">
            <h1 className="mt-2 text-lg font-semibold whitespace-nowrap ">Table: {selectedTable}</h1>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  fetchData(selectedTable);
                }}
                icon={<AiOutlineReload />}
                text="Refresh"
              />
              <Button
                onClick={() => {
                  setOpen(true), setEditing(true);
                }}
                icon={<AiOutlineEdit />}
                text="Edit table"
              />
              <Button
                onClick={handleDeleteTable}
                icon={loading ? <CgSpinner className="text-xl animate-spin" /> : <AiOutlineDelete className="mt-0.5" />}
                text={loading ? "Deleting..." : "Delete table"}
              />
            </div>
          </div>
          <div className="flex gap-2 p-2 mb-2 border border-borderColor ">
            {primaryColumn !== null ? (
              <div className="flex justify-between w-full">
                <div className="flex gap-2">
                  <Button onClick={handleReset} icon={<RxReset />} text={"Reset"} />
                  <Button onClick={handleSave} icon={<AiOutlineSave />} text={"Save"} />
                </div>
                <div className="flex gap-2">
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="block w-full text-sm border border-borderColor text-primary bg-background hover:bg-hoverBg"
                    type="text"
                    placeholder="Search"
                  />
                  <Button
                    onClick={() => (sortOrder === "asc" ? setSortOrder("desc") : setSortOrder("asc"))}
                    icon={sortOrder === "asc" ? <AiOutlineSortDescending /> : <AiOutlineSortAscending />}
                    text={"Sort"}
                  />

                  <select
                    id="key_value"
                    name="key_value"
                    className="block w-full text-sm border border-borderColor text-primary bg-background hover:bg-hoverBg"
                    defaultValue="id"
                    onChange={(e) => setOrderKey(e.target.value)}
                  >
                    {columns.map((item, index) => (
                      <option key={index}>{item.id}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <Button onClick={handleSave} icon={<TbEditOff />} text={" Read only table"} />
            )}
          </div>
          <div id="dataSheetGridContainer">
            {!sortLoading && <DataSheetGrid value={data} onChange={setData} columns={columns} height={viewportHeight} createRow={() => ({ id: genId() })} />}
          </div>
        </>
      )}
    </AppLayout>
  );
}
