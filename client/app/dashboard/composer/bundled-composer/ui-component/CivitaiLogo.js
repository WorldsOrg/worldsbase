// ==============================|| LOGO ||============================== //
import { Box } from "@mui/material";
import "../index.css";

const CivitaiLogo = () => {
  return (
    <Box style={{ cursor: "pointer" }}>
      <img src={"/civitai.avif"} alt="logo" style={{ height: "50px", marginRight: "8px" }} />
    </Box>
  );
};

export default CivitaiLogo;
