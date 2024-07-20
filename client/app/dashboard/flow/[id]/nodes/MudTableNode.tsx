import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function MudTableNode({ isConnectable, id, data }: { data: any; isConnectable: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();

  return (
    <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col bg-gray-200"`}>
      <div className="flex justify-between">
        <label htmlFor="text" className="block text-gray-500 text-md mb-2">
          Mud Table Function - id:{id}
        </label>
      </div>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />

      {/* TODO: Fill out */}

      <Handle type="source" position={Position.Right} id="b" isConnectable={isConnectable} />
    </div>
  );
}

export default MudTableNode;
