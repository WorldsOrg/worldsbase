import { useBreakpointValue } from "@chakra-ui/react";

const useIsDesktop = () => {
  const isDesktop = useBreakpointValue({
    base: false,
    md: true,
  });

  return isDesktop;
};

export default useIsDesktop;
