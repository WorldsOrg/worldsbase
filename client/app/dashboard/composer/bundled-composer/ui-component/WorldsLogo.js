// ==============================|| LOGO ||============================== //
import { Box } from "@mui/material";
import "../index.css";

const WorldsLogo = () => {
  return (
    <Box style={{ cursor: "pointer" }}>
      <img src={"/worlds.png"} alt="logo" style={{ height: "50px", marginRight: "8px" }} />
    </Box>
  );
};

export default WorldsLogo;
