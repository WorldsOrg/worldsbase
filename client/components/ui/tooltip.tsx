"use client";
import { ReactNode } from "react";
import {
  Tooltip as ChakraTooltip,
  PlacementWithLogical,
} from "@chakra-ui/react";
import { useTheme } from "@/context/themeContext";
import { colors } from "@/utils/colors";

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: PlacementWithLogical;
}

const Tooltip = ({ label, children, placement = "top" }: TooltipProps) => {
  const { theme } = useTheme();

  const tooltipColors = {
    bg: colors[theme === "dark" ? "light" : "dark" ]?.background,
    color: colors[theme]?.background,
  };

  return (
    <ChakraTooltip
      label={label}
      placement={placement}
      bg={tooltipColors.bg}
      color={tooltipColors.color}
    >
      {children}
    </ChakraTooltip>
  );
};

export default Tooltip;