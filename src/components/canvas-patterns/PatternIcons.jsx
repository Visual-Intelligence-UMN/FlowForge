import { useId } from "react";

const CircleIcon = ({ label }) => {
  const clipId = useId();
  const r = 20; // Larger circle radius
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
      <circle cx={0} cy={0} r={r} fill="none" 
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
      const workerSpacing = 100;
      const startX = supervisorX - ((workers.length - 1) * workerSpacing) / 2;

      const supervisorIcon = (
        <g transform={`translate(${supervisorX}, ${supervisorY})`} key="supervisor">
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

      return (
        <svg width={workers.length * workerSpacing + 50} height="100">
          {supervisorIcon}
          {linesAndWorkers}
        </svg>
      );
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
      const startX = 20;
      const gapX = 40;
      const centerY = 30;

      let agentElements = [];
      let lastX = startX;
      agents.forEach((_, i) => {
        const xPos = startX + i * gapX;
        agentElements.push(
          <g key={`agent-${i}`} transform={`translate(${xPos}, ${centerY})`}>
            <CircleIcon label={`A${i + 1}`} />
          </g>
        );
        if (i > 0) {
          agentElements.push(
            line(xPos - gapX + 20, centerY, xPos - 20, centerY, `line-${i}`)
          );
        }
        lastX = xPos;
      });

      let summaryElements = [];
      if (withSummary) {
        const summaryX = lastX + gapX + 30;
        summaryElements.push(
          <g key="summary" transform={`translate(${summaryX}, ${centerY})`}>
            <CircleIcon label="Sum" />
          </g>
        );
        summaryElements.push(
          line(lastX + 20, centerY, summaryX - 20, centerY, "summary-line")
        );
      }

      const width = agents.length * gapX + 60 + (withSummary ? 30 : 0);
      return (
        <svg width={width} height="60">
          {agentElements}
          {summaryElements}
        </svg>
      );
    }

    case "Parallel": {
      const agents = template?.agents || [];
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
          No zoom out diagram available
        </div>
      );
  }
};
