import { useEffect, useState } from "react";
import StickyNoteDialog from "../Dialog";
import { useReactFlow, useStoreApi } from "reactflow";
function StickyNoteNode({ data, id }: { data: any; id: any }) {
  const { setNodes } = useReactFlow();
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleText = (text: string) => {
    setNodes(
      Array.from(nodeInternals.values()).map((node) => {
        if (node.id !== id) return node;
        node.data = {
          ...node.data,
          text: text,
        };
        return node;
      })
    );
    setText(text);
    setOpen(false);
  };

  useEffect(() => {
    if (data && data.text) setText(data.text);
  }, [data]);

  const handleClick = (e: any) => {
    switch (e.detail) {
      case 2:
        setOpen(true);
        break;
    }
  };
  return (
    <div className="p-4" onClick={handleClick}>
      <StickyNoteDialog open={open} setOpen={setOpen} save={handleText} text={text} />
      {text}
    </div>
  );
}

export default StickyNoteNode;
