<!-- docs/user-interactions.md -->

# [Interact with FlowForge](https://vis-flow-forge-demo.vercel.app) 

> Click the link above to interact with the demo. This page introduces the user interactions supported by FlowForge.

<div style="text-align: center;">
  <img src="./assets/interface.png" width="800px" style="border: 1px solid black;">
</div>

FlowForge provides an interactive environment for designing and exploring multi-agent workflows. Each labeled section of the interface (A, B1, B2, C1, C2, and C3) corresponds to a key feature in the workflow creation process.

---

### A: Task Description

- **Enter Task Context**: Type in a high-level description of the overall task you want to solve or choose from a selection of examples.
- **Generate Initial Plans**: Once you submit a description, FlowForge uses GPT-4o to generate multiple candidate workflow decompositions.

---

### B1: Hierarchical Tree

- **Abstraction Levels**: The hierarchical tree captures the three levels of abstraction in workflow design (task planning, agent assignment, and agent optimization).
- **Navigating the Tree**: Click on a node to select and explore flows, patterns, and configs.
- **Glyph Previews**: Each workflow node has a visual glyph conveying its complexity (e.g., the number of subtasks or the estimated computational cost).

---

### B2: Scatter Plot

- **Comparative View**: The scatter plot displays workflows along two user-selected dimensions (e.g., number of agents vs. latency).
- **Dimension Selection**:
  - **Use the dropdowns** or controls to set the x-axis and y-axis to the metrics you care about (e.g., latency, cost, accuracy).
  - **Gray Margin Areas** appear for workflows missing data in one or both axes (common at higher abstraction levels where certain dimensions are yet unknown).
- **Selective Display**: Only workflows relevant to your current selection in the tree (B1) or one level above appear here, preventing clutter.

---

### C1: Canvas View

- **Workflow Diagram**: Shows the node-link representation of your selected workflow.
  - **Level 1 (Task Planning)**: Nodes are subtasks, and edges show task dependencies.
  - **Level 2 (Agent Assignment)**: Nodes represent agent groups, where zooming out shows summary information (e.g., subtask name, estimated number of LLM calls) and zooming in reveals detailed configurations such as agent roles and collaboration patterns (e.g., reflection, supervision).
  - **Level 3 (Agent Optimization)**: Nodes are individual agents with configurable parameters (e.g., prompt engineering, tool usage).
- **Workflow Navigation**:
  - **“Looks Good, Continue”** advances the workflow from a higher-level design to a more concrete one.
  - **“Try Another One”** generates alternative designs at the same abstraction level.

---

### C2: In-situ Design Suggestions

- **Design Patterns**: Recommendations appear in collapsible cards on the right, each with a name, a visual preview, and a short description.
- **Context-Aware**: Design patterns tend to prioritize different performance dimensions. For instance, if your current scatter plot has a latency axis, patterns such as Redundancy, Reflection, and Discussion are recommended
  and marked along the axis to aid interpretation.
- **Highlight & Explanation**: Hovering over a suggestion card highlights the corresponding parts of the workflow in the Canvas View. Conversely, hovering over a node in the Canvas View shows the pattern(s) currently in use.

---

### C3: Execution Results

- **Run Workflows**: Once you have a complete and detailed workflow, you can execute it to see actual performance metrics (e.g., total run time).
- **Performance Insights**: After execution, results appear in this panel, summarizing the outcome for each step.
- **Iterative Refinement**: If results are suboptimal, you can always revise the workflow’s configuration to better-fit requirements.
