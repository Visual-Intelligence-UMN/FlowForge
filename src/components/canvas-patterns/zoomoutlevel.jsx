
export const ZoomOutDisplay = ({ pattern, template }) => {
    if (!pattern) return null;

    const circle = (cx, cy, label, key) => {
      const r = 10;
      return (
        <g key={key}>
          <circle cx={cx} cy={cy} r={r} fill="lightgray" stroke="black" />
          <text x={cx} y={cy + 4} fontSize="10px" textAnchor="middle" fill="black">
            {label}
          </text>
        </g>
      );
    };
  
    const line = (x1, y1, x2, y2, key) => {
      return (
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
    };
  
    switch (pattern.name) {
      case "Single Agent": {
        return (
          <svg width="100" height="60">
            {circle(50, 30, "A")}
          </svg>
        );
      }

      case "Supervision": {
        const workers = template?.workers || [];
        const supervisorX = 100; 
        const supervisorY = 20;
        const workerSpacing = 40; 
        const startX = supervisorX - ((workers.length - 1) * workerSpacing) / 2; 

        const supervisorCircle = circle(supervisorX, supervisorY, "S");
      
        let linesAndWorkers = [];
        workers.forEach((w, idx) => {
          const xPos = startX + idx * workerSpacing; 
          const yPos = 60; 
          linesAndWorkers.push(circle(xPos, yPos, `W${idx + 1}`, `worker-${idx}`));
          linesAndWorkers.push(line(supervisorX, supervisorY + 10, xPos, yPos - 10, `line-${idx}`));
        });
      
        return (
          <svg width={workers.length * workerSpacing + 50} height={100}>
            {supervisorCircle}
            {linesAndWorkers}
          </svg>
        );
      }
      
      case "Reflection": {
        return (
          <svg width="120" height="60">
            {circle(30, 30, "1")}
            {circle(90, 30, "2")}
            {line(40, 30, 80, 30)}
          </svg>
        );
      }
  
      case "Discussion": {
        const agents = template?.agents || [];
        const withSummary = template?.withSummary;
        const startX = 20;
        const gapX = 30;
        const centerY = 30;
  
        let agentCircles = [];
        let lastX = startX;
        agents.forEach((_, i) => {
          const xPos = startX + i * gapX;
          agentCircles.push(circle(xPos, centerY, `A${i + 1}`, `agent-${i}`));
          if (i > 0) {
            agentCircles.push(line(xPos - gapX + 10, centerY, xPos - 10, centerY, `line-${i}`));
          }
          lastX = xPos;
        });
  
        let summaryElements = [];
        if (withSummary) {

          const summaryX = lastX + gapX + 30;
          const summaryY = centerY;
          summaryElements.push(circle(summaryX, summaryY, "Sum", "summary"));
          summaryElements.push(line(lastX + 10, centerY, summaryX - 10, centerY, "summary-line"));
        }
  
        const width = (agents.length * gapX) + 60 + (withSummary ? 30 : 0);
        return (
          <svg width={width} height="60">
            {agentCircles}
            {summaryElements}
          </svg>
        );
      }
  
      case "Parallel": {
        const agents = template?.agents || [];
        const startY = 20;
        const gapY = 30;
        const agentX = 30;
        const aggregatorX = 100;
        const aggregatorNode = circle(aggregatorX, startY + (agents.length-1)*gapY/2, "Agg", "agg");
        let parallelElements = [];
        agents.forEach((_, i) => {
          const yPos = startY + i * gapY;
          parallelElements.push(circle(agentX, yPos, `A${i + 1}`, `parallel-agent-${i}`));
          parallelElements.push(line(agentX + 10, yPos, aggregatorX - 10, startY + (agents.length-1)*gapY/2, `agg-line-${i}`));
        });
  
        const height = 40 + (agents.length - 1)*gapY;
        return (
          <svg width="140" height={height}>
            {parallelElements}
            {aggregatorNode}
          </svg>
        );
      }
  
      case "Voting": {
        return (
          <svg width="100" height="60">
            {circle(30, 30, "V1")}
            {circle(70, 30, "V2")}
            {line(40, 30, 60, 30)}
          </svg>
        );
      }
  
      default:
        // fallback
        return <div style={{ fontSize: "12px" }}>No zoom out diagram available</div>;
    }
  };