import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const GenerateTaskFlows = async (task) => {
    const taskDescription = task.description;
    const taskFile = task.uploadedFile || null; 
    // TODO: how to integrate the task file into the task description

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

    // TODO: remove this after testing 
    const sampleTaskFlowData = {
        "taskFlows": [
            {
                "taskFlowId": "tf1",
                "taskFlowName": "Analytical Outline Approach",
                "taskFlowDescription": "This flow focuses on understanding the PDF thoroughly, identifying key elements, and organizing them into a structured presentation script.",
                "isEditing": false,
                "taskFlowSteps": [
                    {
                        "stepName": "Read the Abstract",
                        "stepLabel": "Abstract Review",
                        "stepDescription": "Start by reading the abstract to grasp the central focus and objectives of the paper.",
                        "pattern": 
                            {
                                "name": "PDF Loader Agent",
                                "description": "This design pattern has a single agent to perform the task."
                            }
                        
                    },
                    {
                        "stepName": "Outline the Paper",
                        "stepLabel": "Outline",
                        "stepDescription": "Outline the paper into logical sections that will serve as the basis for presentation slides.",
                        "pattern": 
                            {
                                "name": "Reflection",
                                "description": "This design pattern has a single agent to perform the task."
                            }
                    },
                    {
                        "stepName": "Write Supporting Details",
                        "stepLabel": "Details Integration",
                        "stepDescription": "Expand on the slide outline by adding detailed explanations, transitions, and examples where needed.",
                        "pattern": 
                            {
                                "name": "Single Agent",
                                "description": "This design pattern has a reflection to perform the task."
                            }
                        
                    }
                ]
            },
            {
                "taskFlowId": "tf1",
                "taskFlowName": "Analytical Outline Approach",
                "taskFlowDescription": "This flow focuses on understanding the PDF thoroughly, identifying key elements, and organizing them into a structured presentation script.",
                "isEditing": false,
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
                                "name": "Supervision",
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
                "taskFlowId": "tf3",
                "taskFlowName": "Analytical Outline Approach",
                "taskFlowDescription": "This flow focuses on understanding the PDF thoroughly, identifying key elements, and organizing them into a structured presentation script.",
                "isEditing": false,
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
                                "name": "Supervision",
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
