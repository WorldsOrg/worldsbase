import { useState, useRef, useEffect } from "react";

import PropTypes from "prop-types";

import { Popper } from "@mui/material";

// icons
import { IconPlus, IconSearch, IconMinus } from "@tabler/icons";

// const
import { baseURL } from "../../store/constant";

const AddNodes = ({ nodesData, node, trigger }) => {
  const [searchValue, setSearchValue] = useState("");
  const [nodes, setNodes] = useState({});
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);
  const ps = useRef();

  const scrollTop = () => {
    const curr = ps.current;
    if (curr) {
      curr.scrollTop = 0;
    }
  };

  const filterSearch = (value) => {
    setSearchValue(value);
    setTimeout(() => {
      if (value) {
        const returnData = nodesData.filter((nd) => nd.name.toLowerCase().includes(value.toLowerCase()));
        groupByCategory(returnData, true);
        scrollTop();
      } else if (value === "") {
        groupByCategory(nodesData);
        scrollTop();
      }
    }, 500);
  };

  const groupByCategory = (nodes, isFilter) => {
    const accordianCategories = {};
    const result = nodes.reduce(function (r, a) {
      r[a.category] = r[a.category] || [];
      r[a.category].push(a);
      accordianCategories[a.category] = isFilter ? true : false;
      return r;
    }, Object.create(null));
    setNodes(result);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    if (trigger > 0) setOpen(true);
  }, [trigger]);
  const onDragStart = (event, node) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(node));
    event.dataTransfer.effectAllowed = "move";
  };

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (node) setOpen(false);
  }, [node]);

  useEffect(() => {
    if (nodesData) groupByCategory(nodesData);
  }, [nodesData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false); // Close the component or execute other logic
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <>
      <button ref={anchorRef} className="z-10 fixed bg-black text-white p-2 rounded-full" style={{ left: "150px", top: "150px" }} onClick={handleToggle}>
        {open ? <IconMinus /> : <IconPlus />}
      </button>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [-40, 14],
              },
            },
          ],
        }}
        sx={{ zIndex: 800 }}
      >
        <div ref={wrapperRef} className="absolute z-50 bg-white shadow-lg rounded-lg" style={{ width: "370px", top: "200px", left: "150px" }}>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Add Nodes</h4>
              <IconSearch className="m-2" />
              <input className="p-1" value={searchValue} onChange={(e) => filterSearch(e.target.value)} placeholder="Search nodes" />
            </div>
          </div>
          <div className="flex items-center border-2 rounded-lg" />
          <div style={{ height: "100%", maxHeight: "calc(100vh - 375px)", overflowX: "hidden" }}>
            <div className="my-2">
              <div
                style={{
                  width: "100%",
                  maxWidth: 370,
                  py: 0,
                  borderRadius: "10px",
                }}
              >
                {Object.keys(nodes)
                  .sort()
                  .map((category) => (
                    <div key={category} className="border-b border-gray-200">
                      <button className="flex justify-between items-center w-full p-4 focus:outline-none">
                        <div variant="h5" className="text-lg font-semibold">
                          {category}
                        </div>
                      </button>
                      <div className={`overflow-hidden transition-max-height duration-500 ease-in-out "max-h-screen`}>
                        {nodes[category].map((node, index) => (
                          <div key={node.name} onDragStart={(event) => onDragStart(event, node)} draggable className="cursor-move rounded-lg">
                            <div className="flex items-center p-0">
                              <div className="w-12 h-12 rounded-full bg-white mr-4 flex-shrink-0">
                                <img src={`${baseURL}/api/v1/node-icon/${node.name}`} alt={node.name} className="w-full h-full object-contain p-2.5" />
                              </div>
                              <div>
                                <div className="font-bold">{node.label}</div>
                                <div className="text-sm text-gray-600">{node.description}</div>
                              </div>
                            </div>
                            {index < nodes[category].length - 1 && <div className="border-b" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </Popper>
    </>
  );
};

AddNodes.propTypes = {
  nodesData: PropTypes.array,
  node: PropTypes.object,
  trigger: PropTypes.number,
};

export default AddNodes;
