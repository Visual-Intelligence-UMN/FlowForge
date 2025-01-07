import { Handle, Position } from "@xyflow/react";
import "../langGraphNode.css";

const ExecutorNode = ({ id, data }) => {
  return (
    <div className="single-agent-node">
      {/* Input Handle (for connecting incoming edges) */}
      <Handle type="target" position={Position.Left} id={`in-${id}`} />

      <div className="node-header">🤖 {data.label || "Single Agent"}</div>

      {/* LLM Model Selection */}
      <div className="node-section">
        <label>LLM Model:</label>
        <select value={data.llm} onChange={(e) => data.updateNode(id, "llm", e.target.value)}>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* System Prompt */}
      <div className="node-section">
        <label>System Prompt:</label>
        <textarea
          value={data.systemPrompt}
          onChange={(e) => data.updateNode(id, "systemPrompt", e.target.value)}
          rows={3}
        />
      </div>

      {/* Tools */}
      <div className="node-section">
        <label>Tools:</label>
        {data.tools.length > 0 ? (
          <ul>
            {data.tools.map((tool, index) => (
              <li key={index}>{tool}</li>
            ))}
          </ul>
        ) : (
          <p>None</p>
        )}
      </div>

      {/* Bottom Handle (for outgoing connections) */}
      <Handle type="source" position={Position.Right} id={`out-${id}`} />
    </div>
  );
};

export default ExecutorNode;
