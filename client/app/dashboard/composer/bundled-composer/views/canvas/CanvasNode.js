/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import { Box, Typography, Stack, Tooltip, TextField } from "@mui/material";

// project imports
import MainCard from "../../ui-component/cards/MainCard";

// const
import { baseURL } from "../../store/constant";

const handlerPosition = [[["50%"]], [["30%"], ["70%"]]];

// ===========================|| CANVAS NODE ||=========================== //

const CanvasNode = ({ data }) => {
  const theme = useTheme();

  const CardWrapper = styled(MainCard)(() => ({
    background: "#1B212B",
    color: "#bdc8f0",
    width: "200px",
    height: "90px",
    boxShadow:
      data.type === "action" && data.name !== "ifElse"
        ? "-1px 1px rgba(226, 177, 68, 0.66)"
        : data.type === "action" && data.name === "ifElse"
        ? "-1px 1px  rgba(156, 162, 203, 0.66)"
        : data.type === "trigger"
        ? "-1px 1px rgba(82, 160, 151, 0.66)"
        : "-1px 1px rgba(97, 154, 199, 0.66)",
    "&:hover": {
      boxShadow:
        data.type === "action" && data.name !== "ifElse"
          ? "0px 0px 22px  rgba(226, 177, 68, 0.46)"
          : data.type === "action" && data.name === "ifElse"
          ? "0px 0px 22px  rgba(156, 162, 203, 0.46)"
          : data.type === "trigger"
          ? "0px 0px 22px rgba(82, 160, 151, 0.46)"
          : "0px 0px 22px rgba(97, 154, 199, 0.46)",
    },
  }));
  return (
    <div className="wrapper gradient">
      <CardWrapper
        content={false}
        className="inner"
        sx={{
          borderColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary,
        }}
        border={false}
      >
        <Tooltip title={data.description} placement="top">
          <Box>
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
            <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={2}>
              <Box
                sx={{
                  width: "272px",
                  height: "30px",
                  background:
                    data.type === "action" && data.name !== "ifElse"
                      ? "#E2B144"
                      : data.type === "action" && data.name === "ifElse"
                      ? "#9CA2CB"
                      : data.type === "trigger"
                      ? "#52A097"
                      : "#619AC7",
                  borderRadius: "8px 8px 0px 0px",
                  color: "black",
                }}
              >
                {" "}
                <Typography
                  sx={{
                    fontSize: "14px",
                    fontWeight: 300,
                    padding: "6px",
                    marginLeft: "4px",
                  }}
                >
                  {data.label}
                </Typography>{" "}
              </Box>

              <Box>
                <div
                  style={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    borderRadius: "50%",
                    cursor: "grab",
                    marginLeft: "10px",
                    marginTop: "-8px",
                    paddingBottom: "4px",
                  }}
                >
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      padding: 4,
                      objectFit: "contain",
                    }}
                    src={`${baseURL}/api/v1/node-icon/${data.name}`}
                    alt="Notification"
                  />
                </div>
              </Box>
            </Stack>
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
                  backgroundColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary,
                  top: handlerPosition[data.outputAnchors.length - 1][index],
                }}
              />
            ))}
          </Box>
        </Tooltip>
      </CardWrapper>
    </div>
  );
};

CanvasNode.propTypes = {
  data: PropTypes.object,
};

export default CanvasNode;
