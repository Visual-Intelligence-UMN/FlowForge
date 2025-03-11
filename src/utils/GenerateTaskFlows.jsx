import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import sampleTaskFlows from "../data/sample-taskflows.json";
import sampleTaskFlowsTravel from "../data/sample-tasksflows-travel.json";
import promptTaskflow from "../models/prompt-generate-taskflows.json";

const GenerateTaskFlows = async (task) => {
    const taskDescription = task.description;
    const taskFile = task.uploadedFile || null; 
    // TODO: how to integrate the task file into the task description

    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const systemMessage_schema = promptTaskflow.systemMessage_schema;
    const systemMessage_prompt = promptTaskflow.systemMessage_prompt;

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
    console.log("task", task);
    let sampleTaskFlowData;
    if (task.name === "Travel Planning") {
        sampleTaskFlowData = sampleTaskFlowsTravel;
    } else if (task.name === "Generate Presentation Script") {
        sampleTaskFlowData = sampleTaskFlows;
    } else if (task.name === "Generate Podcast Script") {
        sampleTaskFlowData = sampleTaskFlowsPodcast;
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
