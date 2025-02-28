import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { designPatternsPool } from "../patterns/patternsData";
import promptGeneratePatterns from "../models/prompt-generate-patterns.json";

const GeneratePatterns = async (taskFlow) => {
    const { taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps } = taskFlow;
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const patternsFlow = {
        taskFlowId: taskFlowId,
        taskFlowName: taskFlowName,
        taskFlowDescription: taskFlowDescription,
        taskFlowSteps: [],
    }

    const designPatternSchema = z.object({
        designPatterns: z.array(
            z.object({
                name: z.string(),
                description: z.string(),
            })
        ),
    });

    // // TODO: may change how to decide what design patterns to use for each step
    // const systemMessage = "You are an expert in analyzing tasks, task decomposition, and design patterns selection. \
    // here is the task flow overview: " + taskFlowName + " " + taskFlowDescription + " \
    // consisting of " + taskFlowSteps.length + " steps or subtasks: " + taskFlowSteps.map(step => step.stepName).join(", ") + " \
    // For each step, please analyze the name, label, and description of the step, \
    // and select the top 2 most appropriate design patterns for the step. \
    // The design patterns pool consists of different types of design patterns with various functionalities targetting different needs of the subtasks or steps. \
    // So choose the top 2 most useful design patterns for the subtask, based on how matching the design pattern is to the subtask. \
    // For one subtask, you can select 2 same or 2 different design patterns. \
    // Different subtasks or steps can have different or same design patterns. \
    // The design patterns pool is as follows: \
    // " + designPatternsPool.map(pattern => pattern.name + ": " + pattern.description).join(", ") + " \
    // The design patterns should be selected from the design patterns pool, and return as a list of candidate design patterns for the step. \
    // " 

    const systemMessage = promptGeneratePatterns.systemMessage
    .replace("{{taskFlowName}}", taskFlowName)
    .replace("{{taskFlowDescription}}", taskFlowDescription)
    .replace("{{stepsCount}}", taskFlowSteps.length)
    .replace("{{stepsList}}", taskFlowSteps.map(step => step.stepName).join(", "))
    .replace("{{designPatternsPoolList}}", designPatternsPool.map(pattern => pattern.name + ": " + pattern.description).join(", "));

    for (const step of taskFlowSteps) {
        const stepName = step.stepName;
        const stepLabel = step.stepLabel;
        const stepDescription = step.stepDescription;

        const userMessage = "the subtask name is: " + stepName + " the subtask label is: " + stepLabel + " the subtask description is: " + stepDescription;
        try {
            const completion = await openai.beta.chat.completions.parse({
                model: "gpt-4o-mini",
                messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            response_format: zodResponseFormat(designPatternSchema, "designPattern"),
        });
            const res = completion.choices[0].message.parsed;
            console.log("Design pattern for subtask " + stepName + " is: " + res);
            const designPatterns = res.designPatterns;
            patternsFlow.taskFlowSteps.push({
                stepName: stepName,
                stepLabel: stepLabel,
                stepDescription: stepDescription,
                designPatterns: designPatterns,
            });
        } catch (error) {
            patternsFlow.taskFlowSteps.push({
                stepName: stepName,
                stepLabel: stepLabel,
                stepDescription: stepDescription,
                designPatterns: [],
            });
            console.error("Error generating design pattern for subtask " + stepName + ": " + error);
        }
    }
    return patternsFlow;
}

export default GeneratePatterns;