const handleSingleAgentWithWebSearchTool = (step) => {
    const { stepDescription } = step;
    const taskPrompt = `your task description is ${stepDescription}`;
    const patternSystemPrompt = 'You are a helpful assistant with access to the web, you can search the web for information';
    return {
        type: "singleAgent",
        nodes: [
            {
                type: "singleAgent",
                description: "Agent_tool_search",
                tools: ["tool_WebSearch"],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPrompt + taskPrompt 
            }
        ],
        edges: []
    };
};

const handleSingleAgentWithPDFLoaderTool = (step) => {
    const { stepDescription } = step;
    const taskPrompt = `your task description is ${stepDescription}`;
    const patternSystemPrompt = 'You have access to a PDF loader tool, you can load a PDF file and extract the text. \
    You dont have to respond with the final output and other information, just load the PDF file and extract the text.';
    return {
        type: "singleAgent",
        nodes: [
            {
                type: "singleAgent",
                description: "Agent_tool_pdf_loader",
                tools: ["tool_PDFLoader"],
                llm: "gpt-4o-mini",
                systemPrompt: taskPrompt + patternSystemPrompt 
            }
        ],
        edges: []
    };
};

const handleReflection = (step) => {
    const { stepDescription, template } = step;
    const { evaluator, optimizer } = template;
    const executorPatternPrompt = optimizer.patternPrompt.trim() 
    const reviewerPatternPrompt = evaluator.patternPrompt.trim() 
    const taskPrompt =  'The task for you is ' + stepDescription;

    return {
        type: "reflection",
        nodes: [
            {
                type: "executor",
                description: "Executor",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: executorPatternPrompt,
                systemPrompt: executorPatternPrompt + taskPrompt
            },
            {
                type: "reviewer",
                description: "Reviewer",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: reviewerPatternPrompt,
                systemPrompt: reviewerPatternPrompt + taskPrompt
            }
        ],
        edges: [
            {
                type: "conditional",
                source: "Reviewer",
                target: "Executor",
                label: "Feedback",
            },
            {
                type: "direct",
                source: "Executor",
                target: "Reviewer",
                label: "Submit",
            },
            {
                type: "conditional",
                source: "Reviewer",
                target: "END",
                label: "Approve",
            },
            {
                type: "direct",
                source: "START",
                target: "Executor",
                label: "Start",
            }
        ]
    };
};

const handleSupervision = (step) => {
    const { stepDescription, pattern, template } = step;
    const { workerNum, maxRound, workers = [], supervisor = {} } = template;

    const taskPrompt = 'The task for the team is' + stepDescription;    

    const supervisorPatternPrompt = 
    `You are a helpful supervisor who can coordinate the workers to complete the task \
    You manage the conversation among other workers agents.  \
    Given the request and conversation history, respond with the worker to act next. 
    Each agent will perform a subtask and respond with their restuls and status. \
    When the task is done, you should organize the output and respond with ending with FINISH.`;

    const workerPatternPrompt = `You are a helpful worker who can complete the task.`

    const workerNodes = workers.map((worker, index) => {
        return {
          type: "singleAgent",
          description: `Worker${index + 1}`,
          persona: worker.persona,
          goal: worker.goal,
          tools: [],
          llm: "gpt-4o-mini",
          taskPrompt: taskPrompt,
          patternPrompt: worker.patternPrompt?.trim() || workerPatternPrompt,
          systemPrompt: worker.patternPrompt?.trim() + taskPrompt
        };
      });

      const supervisorNode = {
        type: "supervisor",
        description: "Supervisor",
        persona: supervisor.persona || "Supervisor",
        goal: supervisor.goal || "Supervisor",
        tools: [],
        llm: "gpt-4o-mini",
        taskPrompt: taskPrompt,
        patternPrompt: supervisor.patternPrompt?.trim() || supervisorPatternPrompt,
        systemPrompt: supervisor.patternPrompt?.trim() + taskPrompt,
      };

      const agentEdges = [
        {
          type: "direct",
          source: "START",
          target: "Supervisor",
          label: "start",
        },
        {
          type: "conditional",
          source: "Supervisor",
          target: "END",
          label: "finish",
        },
      ];

      workerNodes.forEach((w) => {
        agentEdges.push({
          type: "conditional",
          source: "Supervisor",
          target: w.description,
          label: "route task",
        });
        agentEdges.push({
          type: "direct",
          source: w.description,
          target: "Supervisor",
          label: "respond",
        });
      });

      return {
        type: "supervision",
        maxRound: maxRound,
        nodes: [supervisorNode, ...workerNodes],
        edges: agentEdges,
      };

    // return {
    //     type: "supervision",
    //     options: members,
    //     members: members_description,
    //     maxRound: maxRound,
    //     nodes: [
    //         {
    //             type: "supervisor",
    //             description: "Supervisor",
    //             tools: [],
    //             llm: "gpt-4o-mini",
    //             systemPrompt: patternSystemPromptSupervisor + taskPrompt
    //         }, 
    //         {
    //             type: "singleAgent",
    //             description: "AgentA",
    //             tools: [],
    //             llm: "gpt-4o-mini",
    //             systemPrompt: patternSystemPromptAgentA + taskPromptAgentA
    //         },
    //         {
    //             type: "singleAgent",
    //             description: "AgentB",
    //             tools: [],
    //             llm: "gpt-4o-mini",
    //             systemPrompt: patternSystemPromptAgentB + taskPromptAgentB
    //         }
    //     ],
    //     edges: [
    //         {
    //             type: "direct",
    //             source: "START",
    //             target: "Supervisor",
    //             label: "start",
    //         },
    //         {
    //             type: "conditional",
    //             source: "Supervisor",
    //             target: "AgentA",
    //             label: "route task",
    //         },
    //         {
    //             type: "conditional",
    //             source: "Supervisor",
    //             target: "AgentB",
    //             label: "route task",
    //         },
    //         {
    //             type: "direct",
    //             source: "AgentA",
    //             target: "Supervisor",
    //             label: "respond",
    //         },
    //         {
    //             type: "direct",
    //             source: "AgentB",
    //             target: "Supervisor",
    //             label: "respond",
    //         },
    //         {
    //             type: "conditional",
    //             source: "Supervisor",
    //             target: "END",
    //             label: "finish",
    //         }
    //     ]
    // };
};

const handleDiscussion = (step) => {
    const { stepDescription, template} = step;
    const { agentNum, withSummary, maxRound, agents = [], summary = {} } = template;

    const taskPrompt = 'The task for the team is' + stepDescription;
    const agentsPatternSystemPrompt = 'You are a helpful assistant who can discuss with other agents to brainstorm and generate ideas';
    const summaryPatternSystemPrompt = 'You are a helpful assistant who can summarize the discussion';
    
    const agentsNodes = agents.map((agent, index) => {
        return {
            type: "singleAgent",
            description: `Agent${index + 1}`,
            tools: [],
            llm: "gpt-4o-mini",
            persona: agent.persona,
            goal: agent.goal,
            taskPrompt: taskPrompt,
            patternPrompt: agent.patternPrompt?.trim() || agentsPatternSystemPrompt,
            systemPrompt: agent.patternPrompt?.trim() + taskPrompt + "Your persona is " + agent.persona + " and your goal is " + agent.goal
        }
    })

    const agentsEdges = [
        {
            type: "direct",
            source: "START",
            target: "Agent1",
            label: "start",
        }
    ]

    agentsNodes.forEach((agent, index) => {
        agentsNodes.forEach((otherAgent, otherIndex) => {
            if (index !== otherIndex) {
                agentsEdges.push({
                    type: "network",
                    source: agent.description,
                    target: otherAgent.description,
                    label: "goto",
                })
            }
        })
    })

    if (withSummary) {
        agentsNodes.push({
            type: "singleAgent",
            description: "Summary",
            tools: [],
            llm: "gpt-4o-mini",
            persona: summary.persona || "Summary",
            goal: summary.goal || "Summary",
            taskPrompt: taskPrompt,
            patternPrompt: summary.patternPrompt?.trim() || summaryPatternSystemPrompt,
            systemPrompt: summary.patternPrompt?.trim()
        })
    }

    if (withSummary) {
        agentsNodes.forEach((agent) => {
            if (agent.description !== "Summary") {  
                agentsEdges.push({
                    type: "network",
                    source: agent.description,
                    target: "Summary",
                    label: "goto",
                })
            }
        })
        agentsEdges.push({
            type: "direct",
            source: "Summary",
            target: "END",
            label: "finish",
        })
    } else {
        agentsNodes.forEach((agent) => {
            agentsEdges.push({
                type: "network",
                source: agent.description,
                target: "END",
                label: "finish",
            })
        })
    }
    return {
        type: "discussion",
        maxRound: maxRound,
        nodes: [...agentsNodes],
        edges: agentsEdges
    };
};

const handleSingleAgent = (step) => {
    const { stepDescription, template } = step;
    const { persona, goal, patternPrompt } = template;
    const taskPrompt = 'The task description for you is ' + stepDescription;
    const patternSystemPrompt = 'You are a helpful assistant who can efficiently solve the task. \
    You should always respond with the final output.';
    return {
        type: "singleAgent",
        nodes: [
            {
                type: "singleAgent",
                description: "Agent",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: patternPrompt,
                systemPrompt: patternPrompt + taskPrompt
            }
        ],
        edges: []
    };
};

const handleVoting = (step) => {
    const { stepDescription, pattern} = step;
    const taskPrompt = 'The task for the voting team is' + stepDescription;
    const patternSystemPrompt = 'You should vote for the best option based on the task requirements.';
    const personaPrompt = 'You are a helpful assistant who can vote for the best option';
    return {
        type: "voting",
        nodes: [
            {
                type: "singleAgent",
                description: "Agent",
                persona: pattern.persona,
                goal: pattern.goal,
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPrompt + taskPrompt
            }
        ],
        edges: []
    }
}

const handlersMap = {
    "Web Search Agent": handleSingleAgentWithWebSearchTool,
    "PDF Loader Agent": handleSingleAgentWithPDFLoaderTool,
    "Reflection": handleReflection,
    "Supervision": handleSupervision,
    "Discussion": handleDiscussion,
    "Single Agent": handleSingleAgent,
};

export { handlersMap };