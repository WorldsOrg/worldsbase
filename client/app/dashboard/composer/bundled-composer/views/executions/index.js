import { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import MainCard from "../../ui-component/cards/MainCard";
import ReactJson from "@microlink/react-json-view";

const Executions = ({ execution, executionCount, isExecutionOpen, anchorEl }) => {
  const [expanded, setExpanded] = useState(false);
  const topValue = anchorEl?.offsetTop ? `${anchorEl.offsetTop + 20}px` : "0px";
  const handleAccordionChange = (executionShortId) => {
    setExpanded(expanded !== executionShortId ? executionShortId : false);
  };

  return (
    <div className={`absolute z-50 ${isExecutionOpen ? "block" : "hidden"}`} style={{ top: topValue + 20, right: 20 }}>
      <MainCard>
        <div className="p-4">
          <div className="font-bold text-lg">{executionCount} Executions</div>
          <div className="overflow-auto max-h-[calc(100vh-250px)]">
            {execution.map((exec, index) => (
              <div key={index} className="border-t mt-2">
                <div onClick={() => handleAccordionChange(exec.shortId)} className="flex justify-between items-center cursor-pointer">
                  <div>{exec.shortId}</div>
                </div>
                {expanded === exec.shortId && (
                  <div>
                    <div>{moment(exec.createdDate).format("MMMM Do YYYY, h:mm:ss A")}</div>
                    <div className="mt-4">
                      <ReactJson src={exec.executionData} name={null} collapsed={false} enableClipboard={true} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </MainCard>
    </div>
  );
};

Executions.propTypes = {
  workflowShortId: PropTypes.string,
  execution: PropTypes.array,
  executionCount: PropTypes.number,
  isExecutionOpen: PropTypes.bool,
  anchorEl: PropTypes.any,
};

export default Executions;
