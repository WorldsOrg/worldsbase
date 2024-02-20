import { Box, Button, Collapse, HStack, Icon, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./side_bar.module.css";
import { useRouter } from "next/navigation";
import { FaFirefoxBrowser } from "react-icons/fa";

export const ApiCollapse = () => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  return (
    <Box>
      <Button className={styles.navigationButton} variant="tertiary" onClick={onToggle} justifyContent="space-between" width="full">
        <HStack spacing="3">
          <Icon as={FaFirefoxBrowser} />
          <Text as="span">API</Text>
        </HStack>
        <PopoverIcon isOpen={isOpen} />
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Stack spacing="1" alignItems="stretch" ps="8" py="1">
          {["auth", "studio", "app", "users", "statistic", "admins", "leaderboard", "items", "matches", "data", "achievements"].map((item) => (
            <Button onClick={() => router.push(`/dashboard/docs/${item}`)} className={styles.navigationButton} key={item} variant="tertiary" justifyContent="start">
              {item}
            </Button>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

export const PopoverIcon = (props: { isOpen: boolean }) => {
  const iconStyles = {
    transform: props.isOpen ? "rotate(-180deg)" : undefined,
    transition: "transform 0.2s",
    transformOrigin: "center",
  };
  return <Icon aria-hidden as={FiChevronDown} __css={iconStyles} />;
};
