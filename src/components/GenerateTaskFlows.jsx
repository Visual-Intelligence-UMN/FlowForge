import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const GenerateTaskFlows = async (task) => {
    const taskDescription = task.description;
    const taskFile = task.uploadedFile || null; // This variable is declared but not used

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const systemMessage_schema =
        "You are an expert in analyzing tasks, task decomposition, and task flow generation. " +
        "You should generate task flows for a given task. You are provided with a task description. \
        You can think step by step and brainstorm ideas to solve the task in multiple and diverse ways. \
        You need to generate 3 task flows for the given task, use different mindsets and strategies to solve the task \
        You dont have to restrict your thinking by the output format, and each taskflow do not have the same number of steps. Though\
        For the output, each taskflow should have a unique id, name, description, and steps list. \
        For each taskflow steps, split the task into specific, coherent, distinct steps, the number of steps can range from 4 to 7. \
        For each step, provide a brief name, a short label and a brief description. do not use number for labelling or name \
        Each taskflow steps can be overlapping, and they are parallel to each other and solving the same provided task. ";

    const systemMessage_prompt =
        "You are an expert in analyzing tasks, task decomposition, and task flow generation. " +
        "You should generate task flows for a given task. You are provided with a task description. \
        You can think step by step and brainstorm ideas to solve the task in multiple and diverse ways. \
        You need to generate 3 task flows for the given task, use different mindsets and strategies to solve the task \
        You dont have to restrict your thinking by the output format, and each taskflow do not have the same number of steps. Though\
        For the output, each taskflow should have a unique id, name, description, and steps list. \
        For each taskflow steps, split the task into specific, coherent, distinct steps, the number of steps can range from 4 to 7. \
        For each step, provide a brief name, a short label and a brief description. \
        Each taskflow steps can be overlapping, and they are parallel to each other and solving the same provided task. \
        One example taskflow output should look like: " +
        " 'taskFlowId: 1,  taskFlowName: 'Task Flow 1', taskFlowDescription: 'Task Flow 1 description', taskFlowSteps: " +
        "[" +
        "{ stepName: 'Step 1', stepLabel: 'Step 1 label', stepDescription: 'Step 1 description' }, " +
        "{ stepName: 'Step 2', stepLabel: 'Step 2 label', stepDescription: 'Step 2 description' }, " +
        "{ stepName: 'Step 3', stepLabel: 'Step 3 label', stepDescription: 'Step 3 description' } " +
        "]" +
        "There should be no more than 3 task flows, and no less than 3 task flows.  \
        Each taskflow steps can be overlapping, and they are parallel to each other and solving the same provided task. ";

    const systemMessage = systemMessage_schema;

    const taskFlowSchema = z.object({
        taskFlows: z.array(
            z.object({
                taskFlowId: z.string(),
                taskFlowName: z.string(),
                taskFlowDescription: z.string(),
                taskFlowSteps: z.array(
                    z.object({
                        stepName: z.string(),
                        stepLabel: z.string(), // Short label for the step
                        stepDescription: z.string(), // Detailed description of the step
                    })
                ),
            })
        ),
    });

    // TODO: remove this after testing the patterns generation
    const sampleTaskFlowData = {
        "taskFlows": [
            {
                "taskFlowId": "tf1",
                "taskFlowName": "Analytical Outline Approach",
                "taskFlowDescription": "This flow focuses on understanding the PDF thoroughly, identifying key elements, and organizing them into a structured presentation script.",
                "taskFlowSteps": [
                    {
                        "stepName": "Read the Abstract",
                        "stepLabel": "Abstract Review",
                        "stepDescription": "Start by reading the abstract to grasp the central focus and objectives of the paper.",
                        "pattern": 
                            {
                                "name": "Single Agent",
                                "description": "This design pattern has a single agent to perform the task."
                            }
                        
                    },
                    {
                        "stepName": "Scan the Paper Structure",
                        "stepLabel": "Structure Overview",
                        "stepDescription": "Skim through headings, subheadings, and major sections to understand the layout and organization of the content.",
                        "pattern": 
                            {
                                "name": "Single Agent",
                                "description": "This design pattern has multiple agents to perform the task."
                            }
                        
                    },
                    {
                        "stepName": "Identify Core Ideas",
                        "stepLabel": "Key Concepts",
                        "stepDescription": "Highlight the main arguments, hypotheses, methods, results, and conclusions from the paper.",
                        "pattern": 
                            {
                                "name": "Discussion",
                                "description": "This design pattern has a discussion to perform the task."
                            }
                        
                    },
                    {
                        "stepName": "Draft Slide Content",
                        "stepLabel": "Slide Outline",
                            "stepDescription": "Organize the key points into logical sections that will serve as the basis for presentation slides.",
                        "pattern": 
                            {
                                "name": "Single Agent",
                                "description": "This design pattern has a single agent to perform the task."
                            }
                    },
                    {
                        "stepName": "Write Supporting Details",
                        "stepLabel": "Details Integration",
                        "stepDescription": "Expand on the slide outline by adding detailed explanations, transitions, and examples where needed.",
                        "pattern": 
                            {
                                "name": "Reflection",
                                "description": "This design pattern has a reflection to perform the task."
                            }
                        
                    },
                    {
                        "stepName": "Polish the Script",
                        "stepLabel": "Script Refinement",
                        "stepDescription": "Refine the script for clarity, coherence, and timing to ensure it aligns with the presentation flow.",
                        "pattern": 
                            {
                                "name": "Supervision",
                                "description": "This design pattern has a supervision to perform the task."
                            }
                        
                    }
                ]
            },
            {
                "taskFlowId": "tf2",
                "taskFlowName": "Visual Storytelling Strategy",
                "taskFlowDescription": "This approach emphasizes turning the academic paper into a compelling narrative for a presentation.",
                "taskFlowSteps": [
                    {
                        "stepName": "Extract Key Themes",
                        "stepLabel": "Theme Identification",
                        "stepDescription": "Analyze the PDF to identify overarching themes or narrative arcs that connect the content."
                    },
                    {
                        "stepName": "Map the Narrative",
                        "stepLabel": "Narrative Outline",
                        "stepDescription": "Create a story-like flow from introduction to conclusion, highlighting discoveries and their impact."
                    },
                    {
                        "stepName": "Design Visual Elements",
                        "stepLabel": "Visual Planning",
                        "stepDescription": "Plan visuals such as graphs, images, or diagrams to complement the narrative and enhance understanding."
                    },
                    {
                        "stepName": "Draft the Script",
                        "stepLabel": "Script Composition",
                        "stepDescription": "Write the script as a conversational and engaging narrative aligned with the visuals."
                    },
                    {
                        "stepName": "Add Hooks and Transitions",
                        "stepLabel": "Engagement Techniques",
                        "stepDescription": "Incorporate questions, quotes, or anecdotes to maintain audience interest and smooth transitions."
                    }
                ]
            },
            {
                "taskFlowId": "tf3",
                "taskFlowName": "Data-Driven Synthesis Method",
                "taskFlowDescription": "This flow centers on extracting data and evidence from the academic paper to form the foundation of the presentation.",
                "taskFlowSteps": [
                    {
                        "stepName": "Isolate Critical Data",
                        "stepLabel": "Data Extraction",
                        "stepDescription": "Identify and extract all critical figures, tables, and data points from the PDF."
                    },
                    {
                        "stepName": "Analyze Methods and Results",
                        "stepLabel": "Results Analysis",
                        "stepDescription": "Break down the methodology and key results to identify their implications and relevance."
                    },
                    {
                        "stepName": "Organize Findings",
                        "stepLabel": "Findings Categorization",
                        "stepDescription": "Group the extracted data into meaningful categories or insights that align with the presentation's objectives."
                    },
                    {
                        "stepName": "Develop Slide Script",
                        "stepLabel": "Script Writing",
                        "stepDescription": "Write the script focused on the data, providing clear explanations and linking the evidence to the paper's goals."
                    },
                    {
                        "stepName": "Validate for Accuracy",
                        "stepLabel": "Accuracy Check",
                        "stepDescription": "Ensure all data points and findings in the script are consistent with the paper and are correctly interpreted."
                    },
                    {
                        "stepName": "Refine for Clarity",
                        "stepLabel": "Clarity Enhancement",
                        "stepDescription": "Edit the script for technical clarity, ensuring it is understandable and impactful for the target audience."
                    }
                ]
            }
        ]
    }

    try {
        // TODO: remove this after testing the patterns generation
        return sampleTaskFlowData;
        const completion = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: taskDescription },
            ],
            response_format: zodResponseFormat(taskFlowSchema, "taskflow"),
        });
        const completion_prompt = await openai.beta.chat.completions.parse({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemMessage_prompt },
                { role: "user", content: taskDescription },
            ],
        });

        console.log("Task flows response prompt:", completion_prompt.choices[0].message.content);
        const res = completion.choices[0].message.parsed;
        console.log("Task flows response formatted:", res);
        return res;
    } catch (error) {
        console.error("Error generating task flows:", error);
        throw error;
    }
};

export default GenerateTaskFlows;
