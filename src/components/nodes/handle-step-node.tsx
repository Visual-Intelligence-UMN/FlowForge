import React from "react";
import { Handle, Position } from "@xyflow/react";

export const HandleStepNode = ({ data, isConnectable, id }) => {
  return <Handle type="target" position={Position.Left} id={`in-${id}`} isConnectable={isConnectable} style={{ top: "50%", background: "#555" }} />;
};
