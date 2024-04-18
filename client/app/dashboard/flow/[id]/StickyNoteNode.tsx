function StickyNoteNode({ data }: { data: any }) {
  const handleClick = (e: any) => {
    console.log(e.detail);
    switch (e.detail) {
      case 1:
        console.log("click");
        break;
      case 2:
        console.log("double click");
        break;
    }
  };
  return (
    <div className="p-4" onClick={handleClick}>
      {data.label}
    </div>
  );
}

export default StickyNoteNode;
