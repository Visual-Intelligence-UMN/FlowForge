import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { designPatternsPool } from "../patterns/patternsData";
import promptGeneratePatterns from "../models/prompt-generate-patterns.json";
import { loadKey } from "./utils";

const GeneratePatterns = async (taskFlow, setPatternsProgress) => {
    const { taskFlowSteps } = taskFlow;

    setPatternsProgress({
      total: taskFlowSteps.length,
      completed: 0,
      currentStep: '',
    });

    const openai = new OpenAI({
        apiKey: loadKey("VITE_OPENAI_API_KEY"),
        dangerouslyAllowBrowser: true,
    });

    const patternsFlow = {
        taskFlowId: taskFlow.taskFlowId,
        taskFlowName: taskFlow.taskFlowName,
        taskFlowDescription: taskFlow.taskFlowDescription,
        taskFlowSteps: [],
        taskFlowStart: taskFlow.taskFlowStart,
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

    for (let i = 0; i < taskFlowSteps.length; i++) {
        const step = taskFlowSteps[i];
        const { stepId, stepName, stepLabel, stepDescription, nextSteps } = step;

        setPatternsProgress({
            total: taskFlowSteps.length,
            completed: i + 1,
            currentStep: stepName,
          });

        const userMessage = "Please recommend patterns for this step as part of the workflow: " + taskFlow.taskFlowDescription + ". " 
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