import PropTypes from "prop-types";
import { useSelector } from "react-redux";
//import { useState } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
//import { styled } from "@mui/material/styles";

// project imports
import LogoSection from "../LogoSection";

import { useState, useEffect } from "react";

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = () => {
  const theme = useTheme();

  const user = useSelector((state) => state.user);

  const [project, setProject] = useState(user.project);

  useEffect(() => {
    setProject(user.project);
  }, [user]);

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: 228,
          height: 44,
          display: "flex",
          [theme.breakpoints.down("md")]: {
            width: "auto",
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: "none", md: "block" }, flexGrow: 1 }}>
          <LogoSection project={project} />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      {/*
    }
      <MaterialUISwitch checked={isDark} onChange={changeDarkMode} />
  */}
      <Button onClick={handleLogout}>Sign Out</Button>
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func,
};

export default Header;
