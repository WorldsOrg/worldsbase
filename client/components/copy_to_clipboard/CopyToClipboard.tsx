import { Button } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import styles from "./copy_to_clipboard.module.css";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

interface CopyToClipboardProps {
  text: string; // The text you want to copy
  label?: string; // Optional label for the button, defaults to "Copy"
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ text, label = "Copy" }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return (
    <Button className={styles.copyButton} onClick={() => copyToClipboard(text)} leftIcon={<CopyIcon />}>
      {isCopied ? "Copied!" : label}
    </Button>
  );
};
