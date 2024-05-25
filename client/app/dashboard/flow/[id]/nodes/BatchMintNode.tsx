import { useTable } from "@/context/tableContext";
import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function BatchMintNode({ isConnectable, id, data }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const { fetchData } = useTable();
  const [transaction, setTransaction] = useState({
    minter: "",
    chainId: "",
    contractAddress: "",
    toAddress: "",
    amount: "",
  });

  const [tableValue, setTableValue] = useState();
  const [methodValue, setMethodValue] = useState();
  const [enabled, setEnabled] = useState(false);
  const [filter, setFilter] = useState({ column: "id", filter: "Equals", value: "" });

  useEffect(() => {
    if (data && data.table) {
      setTableValue(data.table);
      fetchData(data.table);
    }

    if (data && data.method) {
      setMethodValue(data.method);
    }

    if (data && data.filter) {
      setEnabled(true);
      setFilter(data.filter);
    }
  }, [id]);

  useEffect(() => {
    setTransaction(
      data.transaction || {
        minter: "",
        chainId: "",
        contractAddress: "",
        toAddress: "",
        amount: "",
      }
    );
  }, [data]);

  const handleTableChange = (evt: any) => {
    setTableValue(evt.target.value);
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          table: evt.target.value,
        };
        return node;
      })
    );
  };

  const handleTransaction = (evt: any) => {
    setTransaction({
      ...transaction,
      [evt.target.name]: evt.target.value,
    });
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          transaction: {
            ...transaction,
            [evt.target.name]: evt.target.value,
          },
        };
        return node;
      })
    );
  };

  return (
    <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col bg-gray-200"`}>
      <div className="flex justify-between">
        <label htmlFor="text" className="block text-gray-500 text-md mb-2">
          Batch Mint - id:{id}
        </label>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex-grow mr-2">
        <div>Table</div>
        <select
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          onChange={handleTableChange}
          value={tableValue}
        >
          {data.tables.map((table: { table_name: string }) => (
            <option key={table.table_name}>{table.table_name}</option>
          ))}
        </select>
        <div className="mt-2">Mint Details</div>
        <input
          type="text"
          name="contractAddress"
          id="contractAddress"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Contract Address (Token)"
          value={transaction.contractAddress}
          onChange={handleTransaction}
        />
        <input
          type="text"
          name="minter"
          id="minter"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Minter (Master Wallet)"
          value={transaction.minter}
          onChange={handleTransaction}
        />
        <input
          type="text"
          name="chainId"
          id="chainId"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Chain ID"
          value={transaction.chainId}
          onChange={handleTransaction}
        />
        <div className="mt-2">Data</div>
        <input
          type="text"
          name="toAddress"
          id="toAddress"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="toAddress"
          value={transaction.toAddress}
          onChange={handleTransaction}
        />
        <input
          type="text"
          name="amount"
          id="amount"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Amount (in ether)"
          value={transaction.amount}
          onChange={handleTransaction}
        />
      </div>

      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default BatchMintNode;
