import { Box, Button, Collapse, HStack, Icon, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { FiChevronDown, FiFile } from "react-icons/fi";
import styles from "./side_bar.module.css";
import { useRouter } from "next/navigation";

export const DocumentCollapse = () => {
  const { isOpen, onToggle } = useDisclosure();
  const router = useRouter();
  return (
    <Box>
      <Button
        className={styles.navigationButton}
        variant="tertiary"
        onClick={() => {
          onToggle(), router.push("/dashboard/docs/tutorial");
        }}
        justifyContent="space-between"
        width="full"
      >
        <HStack spacing="3">
          <Icon as={FiFile} />
          <Text as="span">Tutorial</Text>
        </HStack>
        <PopoverIcon isOpen={isOpen} />
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Stack spacing="1" alignItems="stretch" ps="8" py="1">
          {["Create game variables", "Manage game items", "Handle users", "See match stats"].map((item) => (
            <Button className={styles.navigationButton} key={item} variant="tertiary" justifyContent="start">
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
