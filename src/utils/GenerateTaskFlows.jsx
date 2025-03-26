import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

import sampleTaskFlowsPresentation from "../data/sample-taskflows-presentation.json";
import sampleTaskFlowsTravel from "../data/sample-tasksflows-travel.json";
import sampleTaskFlowsPodcast from "../data/sample-taskflows-podcast.json";
import sampleTaskFlowsReview from "../data/sample-taskflows-review.json";
import sampleTaskFlowsVis from "../data/sample-taskflows-vis.json";

import promptTaskflow from "../models/prompt-generate-taskflows.json";

const GenerateTaskFlows = async (task, runRealtime) => {
  let taskDescription = task.description;
  const taskFile = task.uploadedFile || null;
  // TODO: how to integrate the task file into the task description
  // I think this should work for passing to GPT - Nick

  function isTextFile(fileContent) {
    for (let i = 0; i < fileContent.length; i++) {
      const charCode = fileContent.charCodeAt(i);
      if (
        (charCode < 32 || charCode > 126) &&
        charCode !== 10 &&
        charCode !== 9
      ) {
        return false;
      }
    }
    return true;
  }

  if (taskFile) {
    const fileContent = await taskFile.text();
    if (isTextFile(fileContent)) {
      taskDescription += `\n\nAdditional materials that may be helpful: ${fileContent}`;
    }
  }

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const systemMessage_schema = promptTaskflow.systemMessage_schema.replace(
    "{{flow_num}}",
    "THREE" // conditionally set as THREE or ONE
  );
  const systemMessage = systemMessage_schema;

  const systemMessage_ideas = promptTaskflow.systemMessage_ideas.replace(
    "{{flow_num}}",
    "THREE"
  );
  const systemMessage_oneFlow = promptTaskflow.systemMessage_oneFlow;

  const ideasSchema = z.object({
    flowProposals: z.array(z.string()),
  });

  const taskFlowSchema = z.object({
    taskFlow_1: z.object({
      taskFlowId: z.string(),
      taskFlowName: z.string(),
      taskFlowDescription: z.string(),
      taskFlowStart: z.object({
        nextSteps: z.array(z.string()),
        input: z.object({
          text: z.string(),
          file: z.string(),
        }),
      }),
        taskFlowSteps: z.array(
          z.object({
            stepId: z.string(),
            stepName: z.string(),
            stepLabel: z.string(), // Short label for the step
            stepDescription: z.string(), // Detailed description of the step
            nextSteps: z.array(z.string()),
          })
        ),
    }),
    taskFlow_2: z.object({
      taskFlowId: z.string(),
      taskFlowName: z.string(),
      taskFlowDescription: z.string(),
      taskFlowStart: z.object({
        nextSteps: z.array(z.string()),
        input: z.object({
          text: z.string(),
          file: z.string(),
        }),
      }),
      taskFlowSteps: z.array(
        z.object({
          stepId: z.string(),
          stepName: z.string(),
          stepLabel: z.string(),
          stepDescription: z.string(),
          nextSteps: z.array(z.string()),
        })
      ),
    }),
    taskFlow_3: z.object({
      taskFlowId: z.string(),
      taskFlowName: z.string(),
      taskFlowDescription: z.string(),
      taskFlowStart: z.object({
        nextSteps: z.array(z.string()),
        input: z.object({
          text: z.string(),
          file: z.string(),
        }),
      }),
      taskFlowSteps: z.array(
        z.object({
          stepId: z.string(),
          stepName: z.string(),
          stepLabel: z.string(),
          stepDescription: z.string(),
          nextSteps: z.array(z.string()),
        })
      ),
    }),
  });

  const oneTaskFlowSchema = z.object({
    taskFlowId: z.string(),
    taskFlowName: z.string(),
    taskFlowDescription: z.string(),
    taskFlowStart: z.object({
      nextSteps: z.array(z.string()),
      input: z.object({
        text: z.string(),
        file: z.string(),
      }),
    }),
    taskFlowSteps: z.array(
      z.object({
        stepId: z.string(),
        stepName: z.string(),
        stepLabel: z.string(), // Short label for the step
        stepDescription: z.string(), // Detailed description of the step
      })
    ),
  });

  // TODO: remove this after testing
  console.log("task", task);
  let sampleTaskFlowData;
  if (task.name.includes("Travel")) {
    sampleTaskFlowData = sampleTaskFlowsTravel;
  } else if (task.name.includes("Presentation")) {
    sampleTaskFlowData = sampleTaskFlowsPresentation;
  } else if (task.name.includes("Podcast")) {
    sampleTaskFlowData = sampleTaskFlowsPodcast;
  } else if (task.name.includes("Review a Paper")) {
    sampleTaskFlowData = sampleTaskFlowsReview;
  } else if (task.name.includes("Visualization")) {
    sampleTaskFlowData = sampleTaskFlowsVis;
  }

  let returnData = {};

  const oneStepFlow = {
    taskFlowId: "0",
    taskFlowName: "Baseline",
    taskFlowDescription: "This is a baseline flow",
    taskFlowStart: {
      stepId: "step-0",
      nextSteps: ["step-1"],
      input: {
        text: "",
        file: "",
      },
    },
    taskFlowSteps: [{ 
      stepId: "step-1",
      stepName: "Baseline flow", 
      stepLabel: "Baseline flow", 
      stepDescription: taskDescription,
      nextSteps: [],
      pattern: {
        name: "Single Agent",
        description: "This design pattern has a single agent to perform the task."
      }
    }],
  };
  returnData.taskFlows = [oneStepFlow];

  console.log("sampleTaskFlowData", sampleTaskFlowData);
  try {
    if (!runRealtime) {
      if (task.name.includes("Review a Paper") 
        || task.name.includes("Visualization")
        || task.name.includes("Presentation")) {
        const sampleRes = sampleTaskFlowData.taskFlows;
        const sampleflows = [sampleRes.taskFlow_1, sampleRes.taskFlow_2, sampleRes.taskFlow_3];
        returnData.taskFlows.push(...sampleflows);
        return returnData;
      } else {
        returnData.taskFlows.push(...sampleTaskFlowData?.taskFlows);
        return returnData;
      }
    } else {
      // returnData.taskFlows = [oneStepFlow];
    }

    // const taskFlows = [];
    // const completion = await openai.beta.chat.completions.parse({
    //     model: "gpt-4o-mini",
    //     messages: [
    //         { role: "system", content: systemMessage_ideas },
    //         { role: "user", content: taskDescription },
    //     ],
    //     response_format: zodResponseFormat(ideasSchema, "flowProposals"),
    // });
    // const flowProposals = completion.choices[0].message.parsed.flowProposals;
    // console.log("Task flows proposals formatted:", flowProposals);

    // for (let i = 0; i < flowProposals.length; i++) {
    //     const oneTaskFlow = await openai.beta.chat.completions.parse({
    //         model: "gpt-4o-mini",
    //         messages: [
    //             { role: "system", content: systemMessage_oneFlow },
    //             { role: "user", content: taskDescription },
    //             { role: "user", content: flowProposals[i] },
    //         ],
    //         response_format: zodResponseFormat(oneTaskFlowSchema, "taskflow"),
    //     });
    //     const res = oneTaskFlow.choices[0].message.parsed;
    //     console.log("One task flow response formatted:", res);
    //     taskFlows.push(res);
    // }
    // return {taskFlows: taskFlows};

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: taskDescription },
      ],
      response_format: zodResponseFormat(taskFlowSchema, "taskflow"),
    });
    const res = completion.choices[0].message.parsed;
    console.log("Task flows response formatted:", res);

    const generatedTaskFlows = [res.taskFlow_1, res.taskFlow_2, res.taskFlow_3];

    if (generatedTaskFlows.length > 3) {
      const sortedTaskFlows = generatedTaskFlows.slice(0, 3).sort((a, b) => {
        return a.taskFlowSteps.length - b.taskFlowSteps.length;
      });
      const shortest = sortedTaskFlows[0];  
      const longest = sortedTaskFlows[sortedTaskFlows.length - 1];
      const middle = sortedTaskFlows[Math.floor(sortedTaskFlows.length / 2)];
      returnData.taskFlows.push(shortest, middle, longest);
    } else {
      returnData.taskFlows.push(...generatedTaskFlows);
    }

    // returnData.taskFlows.push(...sampleTaskFlowData.taskFlows);
    return returnData;

  } catch (error) {
    console.error("Error generating task flows:", error);
    throw error;
  }
};

export default GenerateTaskFlows;
