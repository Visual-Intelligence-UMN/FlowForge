import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";

const DisplayPatterns = ({ designPatterns }) => {
    const svgRef = useRef();
  
    useEffect(() => {
      const steps = designPatterns.taskFlowSteps;
      console.log(steps);
  
      // Prepare Nodes and Links
      const nodes = steps.map((step, index) => ({
        id: index,
        label: step.stepLabel + " <" + step.pattern.name + ">",
        name: step.stepName,
        pattern:
          step.pattern instanceof Array
            ? step.pattern.map((p) => p.name).join(", ")
            : step.pattern.name,
      }));
  
      const links = steps.slice(1).map((_, index) => ({
        source: index,
        target: index + 1,
      }));
  
      // Set Dimensions
      const width = 300;
      const height = 300;
  
      // Clear SVG
      d3.select(svgRef.current).selectAll("*").remove();
  
      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);
  
      const simulation = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d) => d.id).distance(10))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(10));
  
      // Draw Links
      const link = svg
        .selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 2);
  
      // Draw Nodes
      const node = svg
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(
          d3
            .drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded)
        );
  
      node
        .append("circle")
        .attr("r", 15)
        .attr("fill", "steelblue");
  
      node
        .append("text")
        .text((d) => d.label)
        .attr("font-size", "12px")
        .attr("dx", 25)
        .attr("dy", 4);
  
      // Simulation Tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
  
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });
  
      // Drag Handlers
      function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
  
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
  
      function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }, []);
  
    return (
      <Box>
        <svg ref={svgRef} style={{ border: "1px solid #ddd", marginTop: "20px" }} />
      </Box>
    );
  };
  
  export default DisplayPatterns;