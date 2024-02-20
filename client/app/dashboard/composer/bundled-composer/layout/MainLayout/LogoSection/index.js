import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// material-ui
import { ButtonBase } from "@mui/material";

// project imports
import config from "../../../config";

import CivitaiLogo from "../../../ui-component/CivitaiLogo";
import WorldsLogo from "../../../ui-component/WorldsLogo";

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ project }) => (
  <ButtonBase disableRipple component={Link} to={config.defaultPath}>
    {project === "worlds" ? <WorldsLogo /> : project === "civitai" ? <CivitaiLogo /> : null}
  </ButtonBase>
);

LogoSection.propTypes = {
  project: PropTypes.string,
};

export default LogoSection;
