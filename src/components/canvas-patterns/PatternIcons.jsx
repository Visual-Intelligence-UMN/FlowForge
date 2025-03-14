import { useId } from "react";

const CircleIcon = ({ label }) => {
  const clipId = useId();
  const r = 20; // Circle radius
  return (
    <g>
      <clipPath id={`circleClip-${clipId}`}>
        <circle cx={0} cy={0} r={r} />
      </clipPath>
      <image
        href="/agent_line.svg"
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        clipPath={`url(#circleClip-${clipId})`}
      />
      <circle cx={0} cy={0} r={r} fill="none" strokeWidth="1" />
      <text x={0} y={25} fontSize="10px" textAnchor="middle" fill="black">
        {label}
      </text>
    </g>
  );
};

const CircleIconMsg = ({ label }) => {
  const clipId = useId();
  const r = 20; // Circle radius
  return (
    <g>
      <clipPath id={`circleClip-${clipId}`}>
        <circle cx={0} cy={0} r={r} />
      </clipPath>
      <image
        href="/agent_msg.svg"
        x={-r}
        y={-r}
        width={r * 2}
        height={r * 2}
        clipPath={`url(#circleClip-${clipId})`}
      />
      <circle cx={0} cy={0} r={r} fill="none" strokeWidth="1" />
      <text x={0} y={25} fontSize="10px" textAnchor="middle" fill="black">
        {label}
      </text>
    </g>
  );
};

export const PatternIcons = ({ pattern, template }) => {
  if (!pattern) return null;

  // Helper for lines
  const line = (x1, y1, x2, y2, key) => (
    <line
      key={key}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="1"
    />
  );

  switch (pattern.name) {
    case "Single Agent": {
      return (
        <svg width="100" height="60">
          <g transform="translate(50,30)">
            <CircleIcon label="A" />
          </g>
        </svg>
      );
    }

    case "Supervision": {
      const workers = template?.workers || [];
      const supervisorX = 100;
      const supervisorY = 20;
      const workerSpacing = 50;

      // If 3 or fewer workers, show them all
      if (workers.length <= 3) {
        const startX = supervisorX - ((workers.length - 1) * workerSpacing) / 2;

        const supervisorIcon = (
          <g transform={`translate(${supervisorX}, ${supervisorY})`} key="supervisor">
            <CircleIcon label="S" />
          </g>
        );

        let linesAndWorkers = [];
        workers.forEach((_, idx) => {
          const xPos = startX + idx * workerSpacing;
          const yPos = 60;
          linesAndWorkers.push(
            <g key={`worker-${idx}`} transform={`translate(${xPos}, ${yPos})`}>
              <CircleIcon label={`W${idx + 1}`} />
            </g>
          );
          linesAndWorkers.push(
            line(supervisorX, supervisorY + 20, xPos, yPos - 20, `line-${idx}`)
          );
        });

        const width = workers.length * workerSpacing + 100;
        const height = 100;

        return (
          <svg width={width} height={height}>
            {supervisorIcon}
            {linesAndWorkers}
          </svg>
        );
      } else {
        // More than 3: show first, "..." (as a different icon), last, plus total
        const firstWorker = { isPlaceholder: false, label: "W1" };
        const placeholder = { isPlaceholder: true, label: "..." };
        const lastWorker = { isPlaceholder: false, label: `W${workers.length}` };

        const displayWorkers = [firstWorker, placeholder, lastWorker];

        const supervisorIcon = (
          <g transform={`translate(${supervisorX}, ${supervisorY})`} key="supervisor">
            <CircleIcon label="S" />
          </g>
        );

        const startX = supervisorX - (2 * workerSpacing) / 2; 
        const yPos = 60;
        let linesAndWorkers = [];

        displayWorkers.forEach((dw, idx) => {
          const xPos = startX + idx * workerSpacing;
          linesAndWorkers.push(
            <g key={`worker-${idx}`} transform={`translate(${xPos}, ${yPos})`}>
              {dw.isPlaceholder ? (
                <CircleIconMsg label={dw.label} />
              ) : (
                <CircleIcon label={dw.label} />
              )}
            </g>
          );
          linesAndWorkers.push(
            line(supervisorX, supervisorY + 20, xPos, yPos - 20, `line-${idx}`)
          );
        });

        // Additional text for total on the far right
        const totalX = startX + 2 * workerSpacing + 40;
        linesAndWorkers.push(
          <text
            key="total-workers"
            x={totalX}
            y={yPos + 5}
            fontSize="12px"
            fill="black"
          >
            {workers.length} workers
          </text>
        );

        const width = totalX + 60;
        const height = 100;

        return (
          <svg width={width} height={height}>
            {supervisorIcon}
            {linesAndWorkers}
          </svg>
        );
      }
    }

    case "Reflection": {
      return (
        <svg width="120" height="60">
          <g transform="translate(30,30)">
            <CircleIcon label="1" />
          </g>
          <g transform="translate(90,30)">
            <CircleIcon label="2" />
          </g>
          {line(40, 30, 80, 30)}
        </svg>
      );
    }

    case "Discussion": {
      const agents = template?.agents || [];
      const withSummary = template?.withSummary;

      // Round-table layout
      const centerX = 100;
      const centerY = 100;
      const radius = 60;

      if (agents.length <= 1) {
        // Handle trivial case
        return (
          <svg width="200" height="200">
            <g transform={`translate(${centerX}, ${centerY})`}>
              <CircleIcon label={agents[0] ? "A1" : "?"} />
            </g>
          </svg>
        );
      }

      // 1) ring lines (between agents)
      const ringLines = [];
      // 2) agent nodes
      const agentElements = [];
      // 3) summary lines (if any)
      const summaryLines = [];
      // 4) summary node (if any)
      let summaryElement = null;

      // Compute agent positions around a circle
      agents.forEach((_, i) => {
        const angle = (2 * Math.PI * i) / agents.length;
        const xPos = centerX + radius * Math.cos(angle);
        const yPos = centerY + radius * Math.sin(angle);

        agentElements.push(
          <g key={`agent-${i}`} transform={`translate(${xPos}, ${yPos})`}>
            <CircleIcon label={`A${i + 1}`} />
          </g>
        );
      });

      // Connect each agent to the next (forming the ring)
      for (let i = 0; i < agents.length; i++) {
        const next = (i + 1) % agents.length;
        const angle1 = (2 * Math.PI * i) / agents.length;
        const angle2 = (2 * Math.PI * next) / agents.length;
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        ringLines.push(line(x1, y1, x2, y2, `ring-${i}`));
      }

      // Optional summary in center
      if (withSummary) {
        // 1) summary lines to each agent
        agents.forEach((_, i) => {
          const angle = (2 * Math.PI * i) / agents.length;
          const xPos = centerX + radius * Math.cos(angle);
          const yPos = centerY + radius * Math.sin(angle);
          summaryLines.push(line(centerX, centerY, xPos, yPos, `sum-line-${i}`));
        });

        // 2) summary node
        summaryElement = (
          <g key="summary" transform={`translate(${centerX}, ${centerY})`}>
            <CircleIcon label="Sum" />
          </g>
        );
      }

      // Expand SVG to comfortably fit the circle
      const svgSize = 2 * (radius + 35);

      return (
        <svg width={svgSize} height={svgSize}>
          {/* Draw order matters! Lines first, then agents, then summary (on top). */}
          {ringLines}
          {agentElements}
          {summaryLines}
          {summaryElement}
        </svg>
      );
    }

    case "Parallel": {
      const agents = template?.agents || [];

      // If 3 or fewer, show all
      if (agents.length <= 3) {
        const startY = 20;
        const gapY = 50;
        const agentX = 30;
        const aggregatorX = 100;
        const aggregatorY = startY + ((agents.length - 1) * gapY) / 2;

        const aggregatorIcon = (
          <g transform={`translate(${aggregatorX}, ${aggregatorY})`} key="agg">
            <CircleIcon label="Agg" />
          </g>
        );

        let parallelElements = [];
        agents.forEach((_, i) => {
          const yPos = startY + i * gapY;
          parallelElements.push(
            <g key={`parallel-agent-${i}`} transform={`translate(${agentX}, ${yPos})`}>
              <CircleIcon label={`A${i + 1}`} />
            </g>
          );
          parallelElements.push(
            line(agentX + 20, yPos, aggregatorX - 20, aggregatorY, `agg-line-${i}`)
          );
        });

        const height = 40 + (agents.length - 1) * gapY;
        return (
          <svg width="140" height={height}>
            {parallelElements}
            {aggregatorIcon}
          </svg>
        );
      } else {
        // More than 3: show first, "..." as a different icon, last
        const aggregatorX = 100;
        const startY = 20;
        const gapY = 50;
        const agentX = 30;
        const aggregatorY = startY + gapY; // roughly center

        const aggregatorIcon = (
          <g transform={`translate(${aggregatorX}, ${aggregatorY})`} key="agg">
            <CircleIcon label="Agg" />
          </g>
        );

        // For display, we show first agent, placeholder, last agent
        const displayAgents = [
          { isPlaceholder: false, label: "A1" },
          { isPlaceholder: true, label: "..." },
          { isPlaceholder: false, label: `A${agents.length}` },
        ];

        let parallelElements = [];
        displayAgents.forEach((item, idx) => {
          const yPos = startY + idx * gapY;
          parallelElements.push(
            <g key={`parallel-agent-${idx}`} transform={`translate(${agentX}, ${yPos})`}>
              {item.isPlaceholder ? (
                <CircleIconMsg label={item.label} />
              ) : (
                <CircleIcon label={item.label} />
              )}
            </g>
          );
          parallelElements.push(
            line(agentX + 20, yPos, aggregatorX - 20, aggregatorY, `agg-line-${idx}`)
          );
        });

        // Show total count near aggregator
        parallelElements.push(
          <text
            key="total-agents"
            x={aggregatorX + 40}
            y={aggregatorY + 5}
            fontSize="12px"
            fill="black"
          >
            ({agents.length} agents)
          </text>
        );

        const height = startY + gapY * 2 + 40; // for three positions + some padding
        return (
          <svg width="200" height={height}>
            {parallelElements}
            {aggregatorIcon}
          </svg>
        );
      }
    }

    case "Voting": {
      return (
        <svg width="120" height="60">
          <g transform="translate(30,30)">
            <CircleIcon label="V1" />
          </g>
          <g transform="translate(90,30)">
            <CircleIcon label="V2" />
          </g>
          {line(40, 30, 80, 30)}
        </svg>
      );
    }

    default:
      return (
        <div style={{ fontSize: "12px" }}>
          No zoom-out diagram available
        </div>
      );
  }
};
