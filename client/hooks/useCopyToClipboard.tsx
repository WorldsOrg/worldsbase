import { useState } from "react";
import { useToast, Box } from "@chakra-ui/react";

const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      toast({
        position: "top",
        duration: 2000,
        render: () => (
          <Box color="white" p={3} bg="#556483" fontFamily="Andale Mono" borderRadius={"10px"}>
            Copied to Clipboard!
          </Box>
        ),
      });

      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    }
  };

  return { copyToClipboard, isCopied };
};

export default useCopyToClipboard;
