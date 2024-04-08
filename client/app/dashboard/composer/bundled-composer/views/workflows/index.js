import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";

// project imports
import ItemCard from "../../ui-component/cards/ItemCard";
import WorkflowEmptySVG from "../../assets/images/workflow_empty.svg";

// API
import workflowsApi from "../../api/workflows";

// Hooks
import useApi from "../../hooks/useApi";

// const
import { baseURL } from "../../store/constant";

// ==============================|| WORKFLOWS ||============================== //

const Workflows = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const currentPath = usePathname();

  const getAllWorkflowsApi = useApi(workflowsApi.getAllWorkflows);

  const addNew = () => {
    router.push(`${currentPath}/canvas`);
  };

  const goToCanvas = (selectedWorkflow) => {
    router.push(`${currentPath}/canvas/?id=${selectedWorkflow.shortId}`);
  };

  useEffect(() => {
    getAllWorkflowsApi.request();
  }, []);

  useEffect(() => {
    setLoading(getAllWorkflowsApi.loading);
  }, [getAllWorkflowsApi.loading]);

  useEffect(() => {
    if (getAllWorkflowsApi.data) {
      try {
        const workflows = getAllWorkflowsApi.data;
        const images = {};

        for (let i = 0; i < workflows.length; i += 1) {
          const flowDataStr = workflows[i].flowData;
          const flowData = JSON.parse(flowDataStr);
          const nodes = flowData.nodes || [];
          images[workflows[i].shortId] = [];

          for (let j = 0; j < nodes.length; j += 1) {
            const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`;
            if (!images[workflows[i].shortId].includes(imageSrc)) {
              images[workflows[i].shortId].push(imageSrc);
            }
          }
        }
        setImages(images);
      } catch (e) {
        console.error(e);
      }
    }
  }, [getAllWorkflowsApi.data]);

  return (
    <div>
      <div className="flex mb-5">
        <div className="ml-auto">
          <button onClick={addNew} className="text-white bg-black hover:bg-blue-600 px-4 py-2 rounded mb-4">
            Add new
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {!isLoading &&
          getAllWorkflowsApi.data &&
          getAllWorkflowsApi.data.reverse().map((data, index) => <ItemCard key={index} onClick={() => goToCanvas(data)} data={data} images={images[data.shortId]} />)}
      </div>
      {!isLoading && (!getAllWorkflowsApi.data || getAllWorkflowsApi.data.length === 0) && (
        <div className="flex flex-col items-center justify-center">
          <div className="p-2">
            <img className="object-cover h-60" src={WorkflowEmptySVG} alt="No Workflows" />
          </div>
          <div className="text-primary">No Workflows Yet</div>
        </div>
      )}
    </div>
  );
};

export default Workflows;
