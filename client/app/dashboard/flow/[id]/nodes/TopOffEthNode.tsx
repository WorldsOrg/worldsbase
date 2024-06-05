import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function TopOffEthNode({ isConnectable, id, data }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    setWallet(data.wallet || "");
  }, [data]);

  const handleWallet = (evt: any) => {
    setWallet(evt.target.value);
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          wallet: evt.target.value,
        };
        return node;
      })
    );
  };

  return (
    <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col bg-gray-200"`}>
      <div className="flex justify-between">
        <label htmlFor="text" className="block text-gray-500 text-md mb-2">
          Top Off Eth - id:{id}
        </label>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      <div className="flex-grow mr-2">
        <input
          type="text"
          name="key"
          id="key"
          className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Wallet Address"
          value={wallet}
          onChange={handleWallet}
        />
      </div>

      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default TopOffEthNode;