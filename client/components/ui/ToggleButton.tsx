"use client";
import { useTheme } from "@/context/themeContext";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

const ToggleButton = ({ isMobile }: { isMobile?: boolean }) => {
  const { toggle, theme } = useTheme();

  const mobileIconText = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      className={
        "text-gray-400 hover:text-primary hover:bg-hoverBg group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
      }
      onClick={() => toggle()}
    >
      {theme === "light" ? (
        <MdOutlineDarkMode
          className="w-6 h-6 "
          aria-hidden="true"
        />
      ) : (
        <MdOutlineLightMode
          className="w-6 h-6 "
          aria-hidden="true"
        />
      )}

      {isMobile ? mobileIconText : null}
    </button>
  );
};

export default ToggleButton;