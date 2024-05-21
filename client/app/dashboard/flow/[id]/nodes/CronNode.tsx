import { useEffect, useState } from "react";
import { Handle, Position, useReactFlow, useStoreApi } from "reactflow";

function CronNode({ data, id }: { data: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const [cronValue, setCronValue] = useState();

  useEffect(() => {
    if (data && data.schedule) {
      setCronValue(data.schedule);
    }
  }, [id]);

  const handleCronChange = (evt: any) => {
    setCronValue(evt.target.value);
    const { nodeInternals } = store.getState();
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        node.data = {
          ...node.data,
          schedule: evt.target.value,
        };
        return node;
      })
    );
  };

  return (
    <>
      <div className={`border border-gray-200 p-4 rounded bg-white w-80 flex flex-col`}>
        <div className="flex justify-between">
          <label htmlFor="text" className="block text-gray-500 text-md mb-2">
            Cron Node - id:{id}
          </label>
        </div>

        <div className="flex-grow mr-2">
          <div>Schedule</div>
          <select
            className="nodrag mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={handleCronChange}
            value={cronValue}
          >
            <option value="* * * * *">Every Minute</option>
            <option value="*/10 * * * *">Every 10 Minutes</option>
            <option value="*/30 * * * *">Every 30 Minutes</option>
            <option value="0 * * * *">Every Hour</option>
            <option value="0 */4 * * *">Every 4 Hours</option>
            <option value="0 */6 * * *">Every 6 Hours</option>
            <option value="0 */12 * * *">Every 12 Hours</option>
            <option value="0 0 * * *">Every Day at Midnight</option>
            <option value="0 0 * * 0">Every Week at Sunday Midnight</option>
            <option value="0 0 1 * *">Every Month on the 1st</option>
            <option value="0 0 1 1 *">Every Year on January 1st</option>
          </select>
        </div>

        <Handle type="source" position={Position.Right} id="b" isConnectable={true} />
      </div>
    </>
  );
}

export default CronNode;
