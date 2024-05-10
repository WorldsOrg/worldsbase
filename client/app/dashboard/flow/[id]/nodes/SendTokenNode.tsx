import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function SendTokenNode({ isConnectable, id, data }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const [transaction, setTransaction] = useState({
    minter: "",
    chainId: "",
    contractAddress: "",
    to: "",
    amount: "",
  });

  useEffect(() => {
    setTransaction(
      data.transaction || {
        minter: "",
        chainId: "",
        contractAddress: "",
        to: "",
        amount: "",
      }
    );
  }, [data]);

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
          Send Token - id:{id}
        </label>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex-grow mr-2">
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
          name="to"
          id="to"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="To"
          value={transaction.to}
          onChange={handleTransaction}
        />
        <input
          type="text"
          name="amount"
          id="amount"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Amount (in wei)"
          value={transaction.amount}
          onChange={handleTransaction}
        />
      </div>

      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default SendTokenNode;
