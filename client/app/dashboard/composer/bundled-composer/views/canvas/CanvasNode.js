/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
// const
import { baseURL } from "../../store/constant";

const handlerPosition = [[["50%"]], [["30%"], ["70%"]]];

// ===========================|| CANVAS NODE ||=========================== //

const CanvasNode = ({ data }) => {
  return (
    <div className="wrapper gradient">
      <div className={`has-tooltip inner bg-[#1B212B] text-[#bdc8f0] w-200 h-90 shadow-custom ${data.selected ? "border-primary" : "border-textSecondary"} border`}>
        <span className="tooltip rounded shadow-lg p-1 bg-black text-white -mt-18 fixed top-12">{data.description} </span>

        {data.inputAnchors.map((inputAnchor, index) => (
          <Handle
            type="target"
            position={Position.Left}
            key={inputAnchor.id}
            id={inputAnchor.id}
            style={{
              visibility: "false",
              height: 15,
              width: 0,
              borderRadius: "0px",
              bottom: handlerPosition[data.inputAnchors.length - 1][index],
            }}
          />
        ))}

        <div
          className={`bg-[${
            data.type === "action" && data.name !== "ifElse"
              ? "#E2B144"
              : data.type === "action" && data.name === "ifElse"
              ? "#9CA2CB"
              : data.type === "trigger"
              ? "#52A097"
              : "#619AC7"
          }] w-272 h-30 rounded-t-lg text-black`}
        >
          <span className="text-sm font-light p-1.5 ml-1">{data.label}</span>
        </div>

        <div className="flex flex-col justify-start items-start space-y-2">
          <div
            style={{
              borderRadius: "50%",
              cursor: "grab",
              marginLeft: "10px",
              marginTop: "-8px",
              paddingBottom: "4px",
            }}
          >
            <img
              style={{
                width: "40px",
                height: "40px",
                padding: 4,
                objectFit: "contain",
              }}
              src={`${baseURL}/api/v1/node-icon/${data.name}`}
              alt="Notification"
            />
          </div>
        </div>

        {data.outputAnchors.map((outputAnchor, index) => (
          <Handle
            type="source"
            position={Position.Right}
            key={outputAnchor.id}
            id={outputAnchor.id}
            style={{
              marginTop: "10px",
              borderRadius: "0px",
              height: 10,
              width: 4,

              top: handlerPosition[data.outputAnchors.length - 1][index],
            }}
          />
        ))}
      </div>
    </div>
  );
};

CanvasNode.propTypes = {
  data: PropTypes.object,
};

export default CanvasNode;
