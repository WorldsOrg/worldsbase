import { useEffect, useState } from "react";

// material-ui
import { Grid, Box, Stack, Button, Divider } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import { useRouter, usePathname } from "next/navigation";

// project imports
import ItemCard from "../../ui-component/cards/ItemCard";
import { gridSpacing } from "../../store/constant";
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

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const addNew = () => {
    router.push(`${currentPath}/canvas`)
  };

  const goToCanvas = (selectedWorkflow) => {
    router.push(`${currentPath}/canvas/?id=${selectedWorkflow.shortId}`)
    return {};
  };

  useEffect(() => {
    getAllWorkflowsApi.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <>
      <Stack flexDirection="row">
        <Grid sx={{ mb: 1.25 }} container direction="row">
          <Box sx={{ flexGrow: 1 }} />
          <Grid item sx={{ marginRight: '10px' }}>
            <Button
              variant="contained"
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              className="text-white border bg-secondary hover:bg-secondaryHover"
            >
              Add new
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  addNew();
                }}
              >
                Create new
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose} color="red" sx={{ fontWeight: "bold" }}>
                Templates
              </MenuItem>
              <MenuItem onClick={handleClose}>Onboarding Flow</MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  addNew();
                }}
              >
                Sub Achievements
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Stack>
      <Grid container spacing={gridSpacing}>
        {!isLoading &&
          getAllWorkflowsApi.data &&
          getAllWorkflowsApi.data.reverse().map((data, index) => (
            <Grid key={index} item lg={12} md={12} sm={12} xs={12}>
                
                  <ItemCard onClick={() => goToCanvas(data)} data={data} images={images[data.shortId]} />
                
            </Grid>
          ))}
      </Grid>
      {!isLoading && (!getAllWorkflowsApi.data || getAllWorkflowsApi.data.length === 0) && (
        <Stack sx={{ alignItems: "center", justifyContent: "center" }} flexDirection="column">
          <Box sx={{ p: 2, height: "auto" }}>
            <img style={{ objectFit: "cover", height: "30vh", width: "auto" }} src={WorkflowEmptySVG} alt="WorkflowEmptySVG"  className="text-primary"/>
          </Box>
          <div className="text-primary">No Workflows Yet</div>
        </Stack>
      )}
    </>
  );
};

export default Workflows;
