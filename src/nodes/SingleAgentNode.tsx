import { Handle, Position } from "@xyflow/react";
import "../langGraphNode.css";

const SingleAgentNode = ({ id, data }) => {
  return (
    <div className="single-agent-node">
      <div style={{ fontWeight: "bold", marginBottom: "10px" }}>🤖 LLM Agent</div>

      {/* Agent Name Input */}
      <label>
        Agent Name:
        <input
          type="text"
          value={data.agentName}
          onChange={(e) => data.updateNode(id, "agentName", e.target.value)}
        />
      </label>

      {/* System Message Input */}
      <label>
        System Msg:
        <input
          type="text"
          value={data.systemMessage}
          onChange={(e) => data.updateNode(id, "systemMessage", e.target.value)}
        />
      </label>

      {/* Dropdown for Foundation Models */}
      <label>
        Model:
        <select
          value={data.model}
          onChange={(e) => data.updateNode(id, "model", e.target.value)}
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4-mini">GPT-4 Mini</option>
          <option value="other">Other</option>
        </select>
      </label>

      {/* Slider for Temperature */}
      <label>
        Temperature:
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={data.temperature}
          onChange={(e) => data.updateNode(id, "temperature", Number(e.target.value))}
        />
        <span>{data.temperature?.toFixed(2)}</span>
      </label>

      {/* Bottom Left Handle for Custom Tool Nodes */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="tool-node"
        className="single-agent-node-handle"
        style={{ left: 10 }}
      />
    </div>
  );
};

export default SingleAgentNode;
