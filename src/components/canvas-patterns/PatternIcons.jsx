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
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        // stroke="black"
        strokeWidth="1"
      />
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
      // Supervisor coordinates
      const supervisorX = 100;
      const supervisorY = 20;
      // Spacing between workers
      const workerSpacing = 50;

      // If 3 or fewer workers, same approach as before:
      if (workers.length <= 3) {
        const startX = supervisorX - ((workers.length - 1) * workerSpacing) / 2;

        const supervisorIcon = (
          <g
            transform={`translate(${supervisorX}, ${supervisorY})`}
            key="supervisor"
          >
            <CircleIcon label="S" />
          </g>
        );

        let linesAndWorkers = [];
        workers.forEach((w, idx) => {
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

        const width = workers.length * workerSpacing + 100; // somewhat flexible
        const height = 100;

        return (
          <svg width={width} height={height}>
            {supervisorIcon}
            {linesAndWorkers}
          </svg>
        );
      } else {
        // More than 3 workers: show first, "...", last, plus total
        const firstWorker = { label: "W1" };
        const placeholder = { label: "..." };
        const lastWorker = { label: `W${workers.length}` };

        const supervisorIcon = (
          <g
            transform={`translate(${supervisorX}, ${supervisorY})`}
            key="supervisor"
          >
            <CircleIcon label="S" />
          </g>
        );

        // We'll place them horizontally:
        // S --- W1 --- ... --- W(n)
        // And a text at the far right indicating total
        const startX = supervisorX - (2 * workerSpacing) / 2; // we have 3 positions (first, "...", last)
        const yPos = 60;

        // We can create an array with 3 “positions” for the 3 displayed icons
        const displayWorkers = [firstWorker, placeholder, lastWorker];

        let linesAndWorkers = [];

        displayWorkers.forEach((dw, idx) => {
          const xPos = startX + idx * workerSpacing;
          linesAndWorkers.push(
            <g key={`worker-${idx}`} transform={`translate(${xPos}, ${yPos})`}>
              <CircleIcon label={dw.label} />
            </g>
          );
          // Draw a line from Supervisor to each worker
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
            ({workers.length} workers)
          </text>
        );

        const width = totalX + 60; // buffer
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

      // Arrange agents in a circle (round table).
      const centerX = 100;
      const centerY = 100;
      const radius = 60;

      // We'll create one line between each pair of adjacent agents (forming a ring).
      // If withSummary is true, place summary in the center and connect all agents to it.
      const agentElements = [];
      const lineElements = [];

      // If only 1 or 2 agents, handle simply
      if (agents.length <= 1) {
        return (
          <svg width="200" height="200">
            <g transform={`translate(${centerX}, ${centerY})`}>
              <CircleIcon label={agents[0] ? "A1" : "A?"} />
            </g>
          </svg>
        );
      }

      // Compute positions around a circle
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

      // Connect each agent to the next to form a ring
      for (let i = 0; i < agents.length; i++) {
        const next = (i + 1) % agents.length;
        const angle1 = (2 * Math.PI * i) / agents.length;
        const angle2 = (2 * Math.PI * next) / agents.length;
        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        lineElements.push(line(x1, y1, x2, y2, `ring-${i}`));
      }

      // Optional summary in the center
      let summaryElement = null;
      if (withSummary) {
        summaryElement = (
          <g key="summary" transform={`translate(${centerX}, ${centerY})`}>
            <CircleIcon label="Sum" />
          </g>
        );
        // Draw lines from each agent to summary
        agents.forEach((_, i) => {
          const angle = (2 * Math.PI * i) / agents.length;
          const xPos = centerX + radius * Math.cos(angle);
          const yPos = centerY + radius * Math.sin(angle);
          lineElements.push(line(centerX, centerY, xPos, yPos, `sum-line-${i}`));
        });
      }

      // Expand the SVG to comfortably fit the circle
      const svgSize = 2 * (radius + 40);

      return (
        <svg width={svgSize} height={svgSize}>
          {lineElements}
          {agentElements}
          {summaryElement}
        </svg>
      );
    }

    case "Parallel": {
      const agents = template?.agents || [];

      // If 3 or fewer, show them all as before
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
            <g
              key={`parallel-agent-${i}`}
              transform={`translate(${agentX}, ${yPos})`}
            >
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
        // More than 3 agents: first, "...", last
        // aggregator in the middle
        const aggregatorX = 100;
        // We'll just vertically place 3 positions
        const startY = 20;
        const gapY = 50;
        const agentX = 30;
        const aggregatorY = startY + gapY; // aggregator roughly in middle

        const aggregatorIcon = (
          <g transform={`translate(${aggregatorX}, ${aggregatorY})`} key="agg">
            <CircleIcon label="Agg" />
          </g>
        );

        // For display, we show first agent, placeholder, last agent
        const displayAgents = [
          { label: "A1" },
          { label: "..." },
          { label: `A${agents.length}` },
        ];

        let parallelElements = [];
        displayAgents.forEach((dA, idx) => {
          const yPos = startY + idx * gapY;
          parallelElements.push(
            <g
              key={`parallel-agent-${idx}`}
              transform={`translate(${agentX}, ${yPos})`}
            >
              <CircleIcon label={dA.label} />
            </g>
          );
          // line from agent to aggregator
          parallelElements.push(
            line(agentX + 20, yPos, aggregatorX - 20, aggregatorY, `agg-line-${idx}`)
          );
        });

        // Show total count on the right, near aggregator
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

        const height = startY + gapY * 2 + 40; // for the three displayed positions
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
      return <div style={{ fontSize: "12px" }}>No zoom out diagram available</div>;
  }
};
