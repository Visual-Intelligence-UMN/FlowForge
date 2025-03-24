import React, { useState, useEffect, useRef } from "react";
import { Box, Select, Menu, MenuItem } from "@mui/material";
import * as d3 from "d3";


import TreeNode from "./TreeNode";

export default function DimScatter({ treeNav, isHighlighted, stepRScale, agentXScale, agentYScale }) {
    let { nodes, edges } = treeNav;
    nodes = nodes.filter(node => node.data.dims);
    const config = {
        margin: { top: 5, right: 10, bottom: 20, left: 0 },
        nanSpace: 60,
    }
    const [axis, setAxis] = useState({ x: 'taskStepNum', y: 'agentStepNum' });

    const [svgWidth, setSvgWidth] = useState(0);
    const [svgHeight, setSvgHeight] = useState(0);
    const svgRef = useRef(null);

    const xAxisRef = useRef(null);
    const yAxisRef = useRef(null);

    // Measure the SVG width on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (svgRef.current) {
                const { width, height } = svgRef.current.getBoundingClientRect();
                setSvgWidth(width);
                setSvgHeight(height);
            }
        };
        handleResize(); // initial call
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getPaddedExtent = (values, ratio) => {
        const [min, max] = d3.extent(values);
        const padding = (max - min) * ratio;
        return [min - padding, max + padding];
    }

    const xScale = d3.scaleLinear()
        .domain(getPaddedExtent(nodes.map(d => d.data.dims[axis['x']]), 0.1))
        .range([
            config.margin.left + config.nanSpace,
            svgWidth - config.margin.right
        ]);

    const yScale = d3.scaleLinear()
        .domain(getPaddedExtent(nodes.map(d => d.data.dims[axis['y']]), 0.1))
        .range([
            svgHeight - config.margin.bottom - config.nanSpace,
            config.margin.top
        ]);


    const xSelector = <Select
        value={axis.x}
        onChange={e => setAxis({ ...axis, x: e.target.value })}
        sx={{ width: '45%', height: '30px' }}
    >
        <MenuItem value="taskStepNum">Task Step Number</MenuItem>
        <MenuItem value="agentStepNum">Agent Step Number</MenuItem>
        <MenuItem value="maxCalls">Max Calls</MenuItem>
        <MenuItem value="runtime">Runtime</MenuItem>
    </Select>

    const ySelector = <Select
        value={axis.y}
        onChange={e => setAxis({ ...axis, y: e.target.value })}
        sx={{ width: '45%', height: '30px' }}
    >
        <MenuItem value="taskStepNum">Task Step Number</MenuItem>
        <MenuItem value="agentStepNum">Agent Step Number</MenuItem>
        <MenuItem value="maxCalls">Max Calls</MenuItem>
        <MenuItem value="runtime">Runtime</MenuItem>
    </Select>

    // Render axes when svg dimensions or axis selection changes
    useEffect(() => {
        if (svgWidth && svgHeight) {
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);
            d3.select(xAxisRef.current).call(xAxis);
            d3.select(yAxisRef.current).call(yAxis);
        }
    }, [svgWidth, svgHeight, axis, nodes]);

    return <Box
        className="tree-nav"
        sx={{
            width: "100%",
            height: "40vh",
            flexDirection: "column", // vertical stacking
            justifyContent: "center",
            display: "flex",
            alignItems: "flex-start",
            overflow: "auto",
            padding: "15px", // 5px gap around SVG
            boxSizing: "border-box", // ensures padding doesn't affect width/height
        }}
    >
        <Box sx={{ height: "1px", backgroundColor: "#ccc", width: "100%", marginBottom: 2 }} />
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                marginBottom: 2,
                width: "100%",
            }}
        >

            X {xSelector}
            Y {ySelector}
        </Box>

        <Box sx={{ flex: 1, width: "100%", height: "100%" }}>
            <svg className="dim-scatter" width="100%" height="100%" ref={svgRef}>
                <rect 
                    className="background" 
                    x={config.margin.left} 
                    y={config.margin.top} 
                    width={svgWidth - config.margin.left - config.margin.right} 
                    height={svgHeight - config.margin.bottom - config.margin.top} 
                    fill="#fff" 
                    stroke="lightgray" 
                    />
                <rect 
                    className="nonspace x" 
                    x={config.margin.left} 
                    width={config.nanSpace} 
                    y={config.margin.top} 
                    height={svgHeight - config.margin.bottom - config.margin.top} 
                    fill="#aaa" 
                    opacity={0.3} 
                />
                <rect 
                    className="nonspace y" 
                    x={config.margin.left} 
                    width={svgWidth - config.margin.left - config.margin.right}
                    y={svgHeight - config.margin.bottom - config.nanSpace} 
                    height={config.nanSpace} 
                    fill="#aaa" 
                    opacity={0.3} 
                />
                {nodes.map(node => {
                    const x = node.data.dims[axis['x']] 
                            ? xScale(node.data.dims[axis['x']]) 
                            : config.nanSpace / 2 + config.margin.left;
                    const y = node.data.dims[axis['y']] 
                            ? yScale(node.data.dims[axis['y']]) 
                            : svgHeight - config.margin.bottom - config.nanSpace / 2;
                    // console.info(node, node.data.dims[axis['x']], node.data.dims[axis['y']])
                    return <g key={node.label} className={node.label} transform={`translate(${x}, ${y})`}  >
                        {/* <text x={20} y={-10} textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none" }} className="node-text">
                            x: {node.data.dims[axis['x']]} y: {node.data.dims[axis['y']]}
                        </text> */}
                        <TreeNode 
                            node={node} 
                            isHighlighted={isHighlighted(node)} 
                            stepRScale={stepRScale} 
                            agentXScale={agentXScale} 
                            agentYScale={agentYScale} 
                        />
                    </g>
                    }
                )}
                    <g
                        ref={xAxisRef}
                        transform={`translate(0, ${svgHeight - config.margin.bottom - config.nanSpace})`}
                    />
                    {/* <g
                        ref={yAxisRef}
                        transform={`translate(${config.margin.left + config.nanSpace}, 0)`}
                    /> */}

            </svg>
        </Box>
    </Box>
}