import React from "react";
import { MarkerType, Position } from "reactflow";

export const nodes = [
  {
    id: "4",
    type: "custom",
    position: { x: 100, y: 200 },
    data: {
      selects: {
        "handle-0": "smoothstep",
        "handle-1": "smoothstep",
      },
    },
  },

  {
    id: "6",
    type: "output",
    style: {
      background: "#63B3ED",
      color: "white",
      width: 100,
    },
    data: {
      label: "Node",
    },
    position: { x: 400, y: 325 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: "7",
    type: "default",
    className: "annotation",
    data: {
      label: "Our sticky post it for descriptions, which is super cool like Worlds!!! Anyway, this is a feature request from Evan and it seems nice 🥳",
    },
    draggable: true,
    selectable: false,
    position: { x: 150, y: 400 },
  },
  { id: "node-1", type: "textUpdater", position: { x: 0, y: 0 }, data: { value: 123, title: "Insert" } },
  { id: "node-2", type: "textUpdater", position: { x: 400, y: 325 }, data: { value: 123, title: "Update" } },
  { id: "node-3", type: "textUpdater", position: { x: 400, y: 200 }, data: { value: 123, title: "Delete" } },
];

export const edges = [
  { id: "e1-2", source: "1", target: "2", label: "this is an edge label" },
  { id: "e1-3", source: "1", target: "3", animated: true },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    type: "smoothstep",
    sourceHandle: "handle-0",
    data: {
      selectIndex: 0,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: "e4-6",
    source: "4",
    target: "6",
    type: "smoothstep",
    sourceHandle: "handle-1",
    data: {
      selectIndex: 1,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];
