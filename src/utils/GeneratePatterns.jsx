import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { designPatternsPool } from "../patterns/patternsData";
import promptGeneratePatterns from "../models/prompt-generate-patterns.json";

const GeneratePatterns = async (taskFlow) => {
    const { taskFlowId, taskFlowName, taskFlowDescription, taskFlowSteps, taskFlowStart } = taskFlow;
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const patternsFlow = {
        taskFlowId: taskFlowId,
        taskFlowName: taskFlowName,
        taskFlowDescription: taskFlowDescription,
        taskFlowSteps: [],
        taskFlowStart: taskFlowStart,
    }

    const designPatternSchema = z.object({
        designPattern_1: 
            z.object({
                name: z.string(),
                recommendationReason: z.string(),
            }),
        designPattern_2: z.object({
                name: z.string(),
                recommendationReason: z.string(),
            })
    });

    const systemMessage = promptGeneratePatterns.systemMessage
    .replace("{{designPatternsPoolList}}", designPatternsPool.map(pattern => ` - ${pattern.name}: ${pattern.description}`).join("\n"));

    // // console.log("System message to generate patterns:", systemMessage);

    for (const step of taskFlowSteps) {
        const stepId = step.stepId;
        const nextSteps = step.nextSteps;
        const stepName = step.stepName;
        const stepLabel = step.stepLabel;
        const stepDescription = step.stepDescription;

        const userMessage = "Please recommend patterns for this step as part of the workflow: " + taskFlowDescription + ". " 
        + "This specifc stepName is : " + stepName + " The stepLabel: " 
        + stepLabel + " The stepDescription: " + stepDescription;
        try {
            const completion = await openai.beta.chat.completions.parse({
                model: "gpt-4o",
                messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
            ],
            response_format: zodResponseFormat(designPatternSchema, "designPattern"),
        });
            const res = completion.choices[0].message.parsed;
            // console.log("Design pattern for step " + stepName + " is: " + res);
            const designPatterns = [res.designPattern_1, res.designPattern_2];
            patternsFlow.taskFlowSteps.push({
                stepId: stepId,
                stepName: stepName,
                stepLabel: stepLabel,
                stepDescription: stepDescription,
                designPatterns: designPatterns,
                nextSteps: nextSteps,
            });
        } catch (error) {
            patternsFlow.taskFlowSteps.push({
                stepId: stepId,
                stepName: stepName,
                stepLabel: stepLabel,
                stepDescription: stepDescription,
                designPatterns: [],
                nextSteps: nextSteps,
            });
            console.error("Error generating design pattern for subtask " + stepName + ": " + error);
        }
    }
    return patternsFlow;
}

export default GeneratePatterns;