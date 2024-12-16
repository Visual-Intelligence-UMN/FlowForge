import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { useEffect } from "react";

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


    try {
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
