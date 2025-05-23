import React from "react";
import * as d3 from "d3";
import ResultIcon from "./ResultIcon";

export default function TreeNode({ node, isHighlighted, stepRScale, agentXScale, agentYScale }) {

    if (node.data.type == 'flow') {
        return <StepNode node={node} isHighlighted={isHighlighted} stepRScale={stepRScale} />
    }

    else if (node.data.type == 'pattern') {
        const props = { node, isHighlighted, agentXScale, agentYScale };
        return <PatternNode {...props} />
    }
    else if (node.data.type == 'compiled') {
        const props = { node, isHighlighted, agentXScale, agentYScale };
        return <ConfigNode {...props} />
    }
    else return <circle
        className="tree-node level2"
        // width={node.width}
        // height={node.height}
        cx={0}
        r={node.height / 2 - 10}
        fill={isHighlighted ? "lightblue" : "white"}
        stroke="gray"
        // strokeWidth={2}
        opacity={isHighlighted ? 1 : 0.1}
    />
}

const ConfigNode = ({ node, isHighlighted, agentXScale, agentYScale }) => {

    return (
        <g className="tree-node level3" >
            <ResultIcon height={node.height / 2} isHighlighted={isHighlighted} />
        </g>)
}

const PatternNode = ({ node, isHighlighted, agentXScale, agentYScale }) => {
    return (
        <g className="tree-node level2" transform={`translate(${- agentXScale(node.data.agentSteps.length) / 2}, 0)`} >
            {node.data.agentSteps.map((step, index) => {
                return <rect x={agentXScale(index)} width={agentXScale.bandwidth()}
                    y={-agentYScale(step) / 2} height={agentYScale(step)}
                    fill={isHighlighted ? "lightblue" : "white"}
                    stroke={isHighlighted ? "none" : "#999"} />
            })}
        </g>)
}

const StepNode = ({ node, isHighlighted, stepRScale }) => {
    const radius = stepRScale(node.data.taskSteps.length);

    const arcGenerator = d3.arc().padAngle(0.2)
    const angleScale = d3.scaleLinear()
        .domain([0, node.data.taskSteps.length])
        .range([0, 2 * Math.PI]); // angles in radians
    return (
        <g className="tree-node level1"  >
            < circle
                className="tree-node level1"
                r={radius}
                // fill="white"
                fill={isHighlighted ? "lightblue" : "white"}
                opacity={isHighlighted ? 1 : 0.1}
                visibility={node.label.includes("Running Results") ? 0 : 1}
            />
            <g className="arcs">
                {node.data.taskSteps.map((step, index) => {
                    const startAngle = angleScale(index);
                    const endAngle = angleScale(index + 1);
                    let arcs = []
                    for (let i = 0; i < step; i++) {
                        const arcPath = arcGenerator.startAngle(startAngle).endAngle(endAngle).innerRadius(radius + i * 3 + 1).outerRadius(radius + i * 3 + 2.5)()
                        arcs.push(<path d={arcPath} fill={isHighlighted ? 'lightblue' : '#999'} />);
                    }

                    return <g key={index}>{arcs}</g>
                })}
            </g>
        </g>
    );
}