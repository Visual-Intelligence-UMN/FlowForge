
# Workflow and Suggestion Generation
  <img src="./assets/levels.png" width="800px" style="border: 1px solid black;" alt="The design space of multi-agent workflows can be conceptualized across three hierarchical levels. Current frameworks primarily operate at the most granular level, which often leads to design fixation (the orange dot) rather than encourage exploration of the full solution space">



The pipeline of the workflow and suggestion generation and customization follow the three levels of abstraction. 


----
Level 1 (Task Planning). The prompt encourages diversity for task planning, in terms of complexity (varying numbers of subtasks), structure (parallel and sequential flows), and perspective (unique thematic focus for each decomposition). 

<details>
<summary>Prompt to suggest Task Planning</summary>
"You are an expert in task analysis, decomposition, and structured task flow generation. Your goal is to clearly decompose a provided task into multiple, diverse, structured workflows. The task to generate workflows: {{TASK}}. INSTRUCTIONS: 1. Generate exactly {{flow_num}} distinct task flows to solve the above task. 2. Each task flow must have a unique perspective, or approach (think outside the box). 3. Specific step count constraints: taskflow_1, `taskFlowSteps` must contain FOUR steps. taskFlow_2, `taskFlowSteps` must contain FIVE steps. taskFlow_3, `taskFlowSteps` must contain THREE steps. taskFlow_4 must contain TWO steps. 4. Steps may occur in parallel or sequentially. If multiple stepIds appear in a `nextSteps` list, they can be done in parallel, Otherwise, they are sequential. At least one taskFlow have parallel steps. 5. Each task flow must explicitly identify its initial step(s) in `taskFlowStart.nextSteps`. 6. Every step must have: - `step-Id`: Unique ID (e.g., 'step-1'), - 'stepName': short descriptive name (no number in the name). 'stepLabel': short label (no number in the label). 'stepDescription': Clearly specify the actions and detailed expected output, explaining how this step can builds on its predecessor(s) to eventually yield the more complete final deliverable for subsequent step. For instance, what sub-result or partial deliverable does this step produce based on predecessor and for the successors, make sure the whole expected output can be delivered in the last step of the work flow. Every step except the final step must have a `nextSteps` array indicating its immediate successors. 7. Provide a generic example input text for each task flow in 'taskFlowStart.input.text', choose one of those if it fits: 'abstraction of the academic paper' or 'a dataset with movies data' . 8. Each workflow should ensure that its last step produce the complete final output, reflecting all sub-results from previous steps in a cohesive conclusion. 9. output follow the JSON-like structure:{taskFlows:{taskFlow_1: {'taskFlowId': 1,'taskFlowName': 'Descriptive Name','taskFlowDescription': 'Brief description of what this flow achieves.','taskFlowStart': {'nextSteps': ['step-1'],'input': {'text': 'generic example input text', 'file': ''} },'taskFlowSteps': [{'stepId': 'step-1','stepName': 'Brief step name without numbers','stepLabel': 'Short label without numbers','stepDescription': 'Brief description of what happens at this step','nextSteps': ['step-2', 'step-3']},{'stepId': 'step-2','stepName': 'Another brief name', 'stepLabel': 'Another short label','stepDescription': 'Brief description','nextSteps': ['step-4']},{'stepId': 'step-3','stepName': 'Parallel step', 'stepLabel': 'Short label','stepDescription': 'Description','nextSteps': ['step-4']},{'stepId': 'step-4','stepName': 'a','stepLabel': 'Short final label','stepDescription': 'Final description of what concludes this task'}],'stepDescription': 'Description','nextSteps': ['step-4']},{'stepId': 'step-4','stepName': 'Final Step Name','stepLabel': 'Short final label','stepDescription': 'Final description of what concludes this task'}]},'... (other task flows structured similarly, varying in length, structure, complexity and perspectives)']}, Important Notes: Always populate nextSteps clearly, except for final step(s). Clearly differentiate parallel (nextSteps with multiple IDs) and sequential (nextSteps with single ID) flows. Ensure the steps in each task flow logically flows from one step's partial result to the next, culminating in a comprehensive final output. Vary the content of each task flow to demonstrate distinct, generalizable and creative approaches for the TASK."
</details>




---

Level 2 (Agent Assignment). The prompts combine each subtask’s context (name, label, and description) with the full curated list of
design patterns (design patterns’ names, organizational structure, and brief examples). GPT-4o then heuristically evaluates the sub-
task characteristics and suggests two suitable candidate patterns.
<details>
<summary>Prompt to suggest Agent Assignment</summary>
"You are an expert in analyzing tasks, and design patterns selection. Your goal is to Examine Each Step Thoroughly: Look at the stepName, stepLabel and stepDescription. Consider the type of work the step requires (e.g., creativity, collaboration, discussion, refinement, parallelization, supervision, or research). Recommend the Top TWO Design Patterns: From the design patterns pool below, choose exactly TWO different design patterns for each step.  Different steps can have the same or different design pattern recommendations, depending on what fits best. Explain the Reasoning: For each recommended design pattern, provide a concise explanation of why it fits the subtask’s needs; Focus on how each design pattern’s strengths align with the requirements and description of the step. Below is the list of available design patterns, pattern name (must match exactly from the list below). Remember: Output exactly TWO recommended design patterns per step, each with a one-sentence justification. Keep your reasoning short, specific, and aligned with the step description. Design Patterns List: {{designPatternsPoolList}}"
</details>


---

Level 3 (Agent Optimization). The prompt ogenerates additional configuration details, such as agents’ persona, goals, communication limits, tailored to the subtask description and assigned pattern. For multi-agent patterns, agents are encouraged to embody distinct perspectives, relevant to the subtask context, aligned with real-world roles, and include domain expertise requirements if needed.

<details>
<summary>Prompt to suggest Agent Optimization</summary>
"Please produce a pattern template that strictly conforms to the provided schema. Please refer to the stepDescription and pattern. Every field in the schema must be explicitly tied to the stepDescription especially the expected output and deliverable. If the design pattern involves multiple agents that require repeated fields (like multiple 'agents' or 'workers' arrays), create distinct entries for each agent, including 1. tailored 'persona' that describes character, focus, personality, or style in detailed, and it should begin with 'You are ' and must related with step Description and expected deliverable. 2. A clear 'goal' that clearly outlines their specific, expected, output and deliverable aligned with the stepDescription and its persona, it should start with 'The goal: '. For numerical or structural fields, select a 3 to 5. Your output must adhere exactly to the JSON schema with no additional or missing fields. Please generate template info suitable and related with the step description"
</details>