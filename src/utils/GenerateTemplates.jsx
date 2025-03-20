import { designPatternsTemplate } from "../patterns/patternsData";
import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import merge from "lodash/merge";

const GenerateTemplatesInfo = async (flow) => {
    const {taskFlowSteps } = flow;
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    });
    const templatesInfo = await Promise.all(taskFlowSteps.map(async (step) => {
        const { stepName, stepDescription, pattern } = step;
        const stepTemplate = designPatternsTemplate[pattern.name];

        // console.log("stepTemplate", stepTemplate);

        const templateSchema = {
            "Single Agent": z.object({
                "persona": z.string(),
                "goal": z.string(),
            }),
            "Web Search Agent": z.object({
                "persona": z.string(),
                "goal": z.string(),
            }),
            // "PDF Loader Agent": z.object({
            //     "persona": z.string(),
            //     "goal": z.string(),
            // }),
            // "Validator": z.object({
            //     "persona": z.string(),
            //     "goal": z.string(),
            // }),
            "Supervision": z.object({
                "persona": z.string(),
                "goal": z.string(),
                "workers": z.array(z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }), z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                })),
                "supervisor": z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }),
            }),
            "Reflection": z.object({
                "maxRound": z.number(),
                "evaluator": z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }),
                "optimizer": z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }),
            }),
            "Discussion": z.object({
                "agents": z.array(z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }), z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }), z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                })),
                "summary": z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }),
            }),
            "Parallel": z.object({
                "agents": z.array(z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }, z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }))),
                "aggregation": z.object({
                    "persona": z.string(),
                    "goal": z.string(),
                }),
            }),
            // "Voting": z.object({
            //     "agents": z.array(z.object({
            //         "persona": z.string(),
            //         "goal": z.string(),
            //     }), z.object({
            //         "persona": z.string(),
            //         "goal": z.string(),
            //     }), z.object({
            //         "persona": z.string(),
            //         "goal": z.string(),
            //     })),
            //     "aggregation": z.object({
            //         "persona": z.string(),
            //         "goal": z.string(),
            //     }),
            // })
        }

        const stepTemplateSchema = templateSchema[pattern.name] || templateSchema["Single Agent"];

        const systemMessage = "You are a helpful assistant that generates the template information for a selected design pattern. Your task is to fill out a JSON pattern template matching the provided schema, using details from the following inputs: The stepName and stepDescription.The pattern name and description. The reason the pattern was recommended for this step. Requirements:The output must strictly follow the JSON schema provided (no additional or missing fields).Each field in the schema should be as detailed and specific to the stepDescription and pattern as possible: Tailor the agent's "persona" to fit the role they will play in this step; Tailor the "goal" to reflect the specific objectives or outcomes needed in this step; If the pattern requires multiple agents (e.g., "Discussion", "Parallel", "Supervision"), create agent entries that align with how you envision each agent contributing to the step’s success; For numerical or structural fields (e.g., "maxRound" for Reflection), pick a reasonable value based on how iterative or complex the step might be; If the pattern uses repeated agent fields (e.g., multiple “agents” arrays), ensure each one has a unique persona name and a goal that directly addresses a different aspect of the step. Remember, your output will be merged into an existing template, so make sure you fill each field thoughtfully and thoroughly."
        const userMessage = "stepName: " + stepName + ". stepDescription: " 
        + stepDescription + ". pattern: " + pattern.name + ". patternDescription: " + pattern.description 
        + ". pattern recommendationReason: " + pattern.recommendationReason 

        try {
            const completion = await openai.beta.chat.completions.parse({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userMessage },
                ],
                response_format: zodResponseFormat(stepTemplateSchema, "template"),
            });
            const res = completion.choices[0].message.parsed;
            // console.log("Templates info:", res);

            const mergedTemplate = merge(stepTemplate, res);
            // console.log("Merged template:", mergedTemplate, "for step:", step);
            return {
                ...step,
                template: mergedTemplate,
            }


        } catch (error) {
            console.error("Error generating templates info:", error);
            return {
                ...step,
                template: stepTemplate,
            }
        }
    }));
       
    return templatesInfo;
}

export default GenerateTemplatesInfo;