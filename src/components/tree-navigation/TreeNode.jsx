import React from "react";
import * as d3 from "d3";

export default function TreeNode({ node, isHighlighted, stepRScale }) {

    if (node.data.type == 'flow') {
        return <StepNode node={node} isHighlighted={isHighlighted} stepRScale={stepRScale} />
    }

    else return <circle
        className="tree-node level2"
        // width={node.width}
        // height={node.height}
        cx={node.width / 2}
        r={node.height / 2 - 10}
        fill={isHighlighted ? "lightblue" : "white"}
        stroke="black"
        // strokeWidth={2}
        opacity={isHighlighted ? 1 : 0.1}
        visibility={node.label.includes("Running Results") ? 0 : 1}
    />
}

const StepNode = ({ node, isHighlighted, stepRScale }) => {
    const radius = stepRScale(node.data.steps.length);

    const arcGenerator = d3.arc().padAngle(0.2)
    const angleScale = d3.scaleLinear()
        .domain([0, node.data.steps.length])
        .range([0, 2 * Math.PI]); // angles in radians
    return (
        <g className="tree-node level1" transform={`translate(${node.width / 2}, 0)`} >
            <circle
                className="tree-node level1"
                // width={node.width}
                // height={node.height}
                r={radius}
                fill={isHighlighted ? "lightblue" : "white"}
                // stroke="black"
                // strokeWidth={2}
                opacity={isHighlighted ? 1 : 0.1}
                visibility={node.label.includes("Running Results") ? 0 : 1}
            />
            <g className="arcs">
                {node.data.steps.map((step, index) => {
                    const startAngle = angleScale(index);
                    const endAngle = angleScale(index + 1);
                    let arcs = []
                    for (let i = 0; i < step; i++) {
                        const arcPath = arcGenerator.startAngle(startAngle).endAngle(endAngle).innerRadius(radius + i * 3).outerRadius(radius + i * 3 + 1.5)()
                        arcs.push(<path d={arcPath} fill="#999" />);
                    }

                    return <g>{arcs}</g>
                })}
            </g>
        </g>
    );
}