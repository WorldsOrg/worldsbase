import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// project imports
import MainCard from "../../ui-component/cards/MainCard";
import NavItem from "../../layout/MainLayout/Sidebar/MenuList/NavItem";

import settings from "../../menu-items/settings";

// ==============================|| SETTINGS ||============================== //

const Settings = ({ workflow, isSettingsOpen, anchorEl, onSettingsItemClick, onUploadFile }) => {
  const [settingsMenu, setSettingsMenu] = useState([]);
  const topValue = anchorEl?.offsetTop ? `${anchorEl.offsetTop + 20}px` : "0px";
  useEffect(() => {
    if (workflow && !workflow.shortId) {
      const settingsMenu = settings.children.filter((menu) => menu.id === "loadWorkflow");
      setSettingsMenu(settingsMenu);
    } else if (workflow && workflow.shortId) {
      const settingsMenu = settings.children;
      setSettingsMenu(settingsMenu);
    }
  }, [workflow]);

  // settings list items
  const items = settingsMenu.map((menu) => (
    <NavItem key={menu.id} item={menu} level={1} navType="SETTINGS" onClick={(id) => onSettingsItemClick(id)} onUploadFile={onUploadFile} />
  ));

  return (
    <div className={`absolute z-50 ${isSettingsOpen ? "block" : "hidden"}`} style={{ position: "absolute", top: topValue + 20, right: 20 }}>
      <MainCard border={false} content={false} className="shadow-lg max-h-[calc(100vh-250px)] overflow-x-hidden">
        <div className="p-2">
          <div className="overflow-y-auto">{items}</div>
        </div>
      </MainCard>
    </div>
  );
};

Settings.propTypes = {
  workflow: PropTypes.object,
  isSettingsOpen: PropTypes.bool,
  anchorEl: PropTypes.any,
  onSettingsItemClick: PropTypes.func,
  onUploadFile: PropTypes.func,
};

export default Settings;
