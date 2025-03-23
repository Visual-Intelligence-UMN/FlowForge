import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";

export default function DimScatter({ treeNav }) {
    let { nodes, edges } = treeNav;
    nodes = nodes.filter(node => node.data.dims);
    const config = {
        margin: { top: 20, right: 30, bottom: 30, left: 40 },
        nanSpace: 30,
    }
    const [axis, setAxis] = useState({ x: 'taskStepNum', y: 'agentStepNum' });

    const [svgWidth, setSvgWidth] = useState(0);
    const svgRef = useRef(null);

    // Measure the SVG width on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (svgRef.current) {
                const width = svgRef.current.getBoundingClientRect().width;
                setSvgWidth(width);
            }
        };
        handleResize(); // initial call
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(nodes, (d) => d.data.dims[axis['x']]))
        .range([
            config.margin.left + config.nanSpace,
            svgWidth - config.margin.right
        ]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(nodes, (d) => d.data.dims[axis['y']]))
        .range([
            svgRef.current ? svgRef.current.clientHeight - config.margin.bottom : 0,
            config.margin.top + config.nanSpace
        ]);

    return <Box
        className="tree-nav"
        sx={{
            width: "100%",
            height: "30vh",

            justifyContent: "center",
            display: "flex",
            alignItems: "flex-start",
            overflow: "auto",
            padding: "15px", // 5px gap around SVG
            boxSizing: "border-box", // ensures padding doesn't affect width/height
        }}
    >
        <svg className="dim-scatter" style={{ border: '1px solid #aaa' }} width="100%" height="100%" ref={svgRef}>
            {nodes.map((node, index) => {
                const x = xScale(node.data.dims[axis['x']]) ?? config.nanSpace / 2;
                const y = yScale(node.data.dims[axis['y']]) ?? config.nanSpace / 2;
                return <circle key={index} cx={x} cy={y} r="5" fill="blue" />
            }
            )}
        </svg>
    </Box>
}