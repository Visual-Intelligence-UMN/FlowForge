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
  const r = 25; // Circle radius
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
      <text x={0} y={35} fontSize="10px" textAnchor="middle" fill="black">
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
        const firstWorker = { isPlaceholder: false, label: "Worker 1" };
        const placeholder = { isPlaceholder: false, label: "Worker 2" };
        const lastWorker = { isPlaceholder: true, label: `${workers.length - 2}+ workers` };

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

        const totalX = startX + 2 * workerSpacing + 40;
        linesAndWorkers.push(
          // <text
          //   key="total-workers"
          //   x={totalX}
          //   y={yPos + 5}
          //   fontSize="12px"
          //   fill="black"
          // >
          //   {workers.length} workers
          // </text>
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

    // case "Discussion": {
    //   const agents = template?.agents || [];
    //   const withSummary = template?.withSummary;
    
    //   // Reduced dimensions for a compact layout
    //   const radius = 40;
    //   const margin = 20;
    //   const centerX = radius + margin;
    //   const centerY = radius + margin;
    
    //   if (agents.length <= 1) {
    //     return (
    //       <svg width={2 * (radius + margin)} height={2 * (radius + margin)}>
    //         <g transform={`translate(${centerX}, ${centerY})`}>
    //           <CircleIcon label={agents[0] ? "A1" : "?"} />
    //         </g>
    //       </svg>
    //     );
    //   }
    
    //   // 1) ring lines (between agents)
    //   const ringLines = [];
    //   // 2) agent nodes
    //   const agentElements = [];
    //   // 3) summary lines (if any)
    //   const summaryLines = [];
    //   // 4) summary node (if any)
    //   let summaryElement = null;
    
    //   // Compute agent positions around a circle
    //   agents.forEach((_, i) => {
    //     const angle = (2 * Math.PI * i) / agents.length;
    //     const xPos = centerX + radius * Math.cos(angle);
    //     const yPos = centerY + radius * Math.sin(angle);
    
    //     agentElements.push(
    //       <g key={`agent-${i}`} transform={`translate(${xPos}, ${yPos})`}>
    //         <CircleIcon label={`A${i + 1}`} />
    //       </g>
    //     );
    //   });
    
    //   // Connect each agent to the next (forming the ring)
    //   for (let i = 0; i < agents.length; i++) {
    //     const next = (i + 1) % agents.length;
    //     const angle1 = (2 * Math.PI * i) / agents.length;
    //     const angle2 = (2 * Math.PI * next) / agents.length;
    //     const x1 = centerX + radius * Math.cos(angle1);
    //     const y1 = centerY + radius * Math.sin(angle1);
    //     const x2 = centerX + radius * Math.cos(angle2);
    //     const y2 = centerY + radius * Math.sin(angle2);
    
    //     ringLines.push(line(x1, y1, x2, y2, `ring-${i}`));
    //   }
    
    //   // Optional summary in center
    //   if (withSummary) {
    //     // Draw summary lines to each agent
    //     agents.forEach((_, i) => {
    //       const angle = (2 * Math.PI * i) / agents.length;
    //       const xPos = centerX + radius * Math.cos(angle);
    //       const yPos = centerY + radius * Math.sin(angle);
    //       summaryLines.push(line(centerX, centerY, xPos, yPos, `sum-line-${i}`));
    //     });
    //     // Summary node at the center
    //     summaryElement = (
    //       <g key="summary" transform={`translate(${centerX}, ${centerY})`}>
    //         <CircleIcon label="Sum" />
    //       </g>
    //     );
    //   }
    
    //   // New SVG size is compact
    //   const svgSize = 2 * (radius + margin);
    
    //   return (
    //     <svg width={svgSize} height={svgSize}>
    //       {ringLines}
    //       {agentElements}
    //       {summaryLines}
    //       {summaryElement}
    //     </svg>
    //   );
    // }
    // ...the rest of your code...

  case "Discussion": {
    const agents = template?.agents || [];
    const withSummary = template?.withSummary;

    // Compact layout for the circle
    const radius = 45;
    const margin = 25;
    // Center coordinates
    const centerX = radius + margin;
    const centerY = radius + margin;

    // SVG dimensions
    const svgSize = 2 * (radius + margin);

    // If 1 or fewer agents, just place single or "?" node
    if (agents.length <= 1) {
      return (
        <svg width={svgSize} height={svgSize}>
          <g transform={`translate(${centerX}, ${centerY})`}>
            <CircleIcon label={agents[0] ? "A1" : "?"} />
          </g>
        </svg>
      );
    }

    // Determine which "agents" to display if there's more than 3
    let displayedAgents;
    if (agents.length <= 3) {
      // Show all actual agents
      displayedAgents = agents.map((_, idx) => ({
        label: `A${idx + 1}`,
        isPlaceholder: false
      }));
    } else {
      // Show first, placeholder, last
      displayedAgents = [
        { label: `${agents.length - 2}+ agents`, isPlaceholder: true },
        { label: "A1", isPlaceholder: false },
        { label: `A2`, isPlaceholder: false }
      ];
    }

    // We'll place `displayedAgents.length` nodes evenly in a circle
    const count = displayedAgents.length; // either 2, 3, or 3 (with placeholder)

    // These arrays will store the SVG elements in layers
    const ringLines = [];
    const agentElements = [];
    const summaryLines = [];
    let summaryElement = null;

    // 1) Create agent nodes around a circle
    displayedAgents.forEach((agent, i) => {
      // Evenly distribute around the circle
      const angle = (2 * Math.PI * i) / count;
      const xPos = centerX + radius * Math.cos(angle);
      const yPos = centerY + radius * Math.sin(angle);

      agentElements.push(
        <g key={`agent-${i}`} transform={`translate(${xPos}, ${yPos})`}>
          {agent.isPlaceholder ? (
            // For the placeholder, you might prefer CircleIconMsg or similar
            <CircleIconMsg label={agent.label} />
          ) : (
            <CircleIcon label={agent.label} />
          )}
        </g>
      );
    });

    // 2) Draw ring lines between each adjacent pair (forming a polygon)
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const angle1 = (2 * Math.PI * i) / count;
      const angle2 = (2 * Math.PI * next) / count;
      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);

      ringLines.push(
        <line
          key={`ring-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth="1"
        />
      );
    }

    // 3) Optional summary in center
    if (withSummary === "true") {
      // Draw lines from summary to each agent node
      for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI * i) / count;
        const xPos = centerX + radius * Math.cos(angle);
        const yPos = centerY + radius * Math.sin(angle);

        summaryLines.push(
          <line
            key={`sum-line-${i}`}
            x1={centerX}
            y1={centerY}
            x2={xPos}
            y2={yPos}
            stroke="black"
            strokeWidth="1"
          />
        );
      }

      summaryElement = (
        <g key="summary" transform={`translate(${centerX}, ${centerY})`}>
          <CircleIcon label="Sum" />
        </g>
      );
    }

    return (
      <svg width={svgSize} height={svgSize}>
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
      // return (
      //   <div style={{ fontSize: "12px" }}>
      //     No zoom-out diagram available
      //   </div>
      // );
      return (
        <svg width="100" height="60">
          <g transform="translate(50,30)">
            <CircleIcon label="A" />
          </g>
        </svg>
      );
  }
};
