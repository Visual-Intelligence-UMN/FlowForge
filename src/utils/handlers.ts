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
        edges: [],
        maxRound: 1,
    };
};

const handleSingleAgentWithPDFLoaderTool = (step) => {
    const { stepDescription } = step;
    const taskPrompt = `your task description is ${stepDescription}`;
    const patternSystemPrompt = 'You should always call the tool to load a PDF file and extract the text, and please clean the text after extracting the content.';
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
        edges: [],
        maxRound: 1,
    };
};

const handleReflection = (step) => {
    const { stepDescription, template } = step;
    const { evaluator, optimizer, maxRound } = template;
    const optimizerPatternPrompt = optimizer.patternPrompt.trim() 
    const evaluatorPatternPrompt = evaluator.patternPrompt.trim() 
    const taskPrompt =  'The task for you is ' + stepDescription;

    return {
        type: "reflection",
        maxRound: maxRound,
        nodes: [
            {
                type: "optimizer",
                description: "Optimizer",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: optimizerPatternPrompt,
                systemPrompt: optimizerPatternPrompt + taskPrompt
            },
            {
                type: "evaluator",
                description: "Evaluator",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: evaluatorPatternPrompt,
                systemPrompt: evaluatorPatternPrompt + taskPrompt
            }
        ],
        edges: [
            {
                type: "conditional",
                source: "Evaluator",
                target: "Optimizer",
                label: "Feedback",
            },
            {
                type: "direct",
                source: "Optimizer",
                target: "Evaluator",
                label: "Submit",
            },
            {
                type: "conditional",
                source: "Evaluator",
                target: "__end__",
                label: "Approve",
            },
            {
                type: "direct",
                source: "START",
                target: "Optimizer",
                label: "Start",
            }
        ]
    };
};

const handleSupervision = (step) => {
    const { stepDescription, pattern, template } = step;
    const { maxRound, workers = [], supervisor = {} } = template;

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
          target: "__end__",
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

};

const handleDiscussion = (step) => {
    const { stepDescription, template} = step;
    const { withSummary, maxRound, agents = [], summary = {} } = template;

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
            target: "__end__",
            label: "finish",
        })
    } else {
        agentsNodes.forEach((agent) => {
            agentsEdges.push({
                type: "network",
                source: agent.description,
                target: "__end__",
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

const handleVoting = (step) => {
    const { stepDescription, template} = step;
    const { maxRound, agents = [], aggregation = {} } = template;

    const taskPrompt = 'The task for the voting team is' + stepDescription;
    const agentsPatternSystemPrompt = 'You can vote the scores based on the rubrics.';
    const aggregatorPatternSystemPrompt = 'You are a helpful assistant who can aggregate the scores of the voting agents.';

    const agentsNodes = agents.map((agent, index) => {
        return {
            type: "singleAgent",
            description: `Voting${index + 1}`,
            persona: agent.persona,
            rubric: agent.rubric,
            tools: [],
            llm: "gpt-4o-mini",
            taskPrompt: taskPrompt,
            patternPrompt: agent.patternPrompt?.trim() || agentsPatternSystemPrompt,
            systemPrompt:  taskPrompt + agent.patternPrompt?.trim() + "Your persona is " + agent.persona + " and your rubric is " + agent.rubric
        }
    })

    agentsNodes.push({
        type: "singleAgent",
        description: "Aggregator",
        tools: [],
        llm: "gpt-4o-mini",
        taskPrompt: taskPrompt,
        patternPrompt: aggregation.patternPrompt?.trim() || aggregatorPatternSystemPrompt,
        systemPrompt: taskPrompt + aggregation.patternPrompt?.trim()
    })

    let agentsEdges = []

    for (let i = 1; i < agents.length; i++) {
        agentsEdges.push({
            type: "direct",
            source: `Voting${i}`,
            target: `Voting${i + 1}`,
            label: "goto",
        })
    }
    agentsEdges.push(
        {
            type: "direct",
            source: "START",
            target: "Voting1",
            label: "start",
        },
        {
            type: "direct",
            source: `Voting${agents.length}`,
            target: "Voting1",
            label: "goto",
        },
        {
            type: "conditional",
            source: `Voting${agents.length}`,
            target: "Aggregator",
            label: "goto",
        },
        {
            type: "direct",
            source: `Aggregator`,
            target: "__end__",
            label: "finish",
        }
    )

    console.log("agentsEdges in handle", agentsEdges);
    return {
        type: "voting",
        maxRound: maxRound,
        nodes: [...agentsNodes],
        edges: agentsEdges
    }
}

const handleParallel = (step) => {
    const { stepDescription, template} = step;
    const { agents = [], aggregation = {}, maxRound } = template;

    const taskPrompt = 'The task is' + stepDescription;
    const agentsPatternSystemPrompt = 'You can complete the task independently.';
    const aggregatorPatternSystemPrompt = 'You should aggregate the previous agents outputs.';

    const agentsNodes = agents.map((agent, index) => {
        return {
            type: "singleAgent",
            description: `Agent${index + 1}`,
            persona: agent.persona,
            goal: agent.goal,
            tools: [],
            llm: "gpt-4o-mini",
            taskPrompt: taskPrompt,
            patternPrompt: agent.patternPrompt?.trim() || agentsPatternSystemPrompt,
            systemPrompt: taskPrompt + agent.patternPrompt?.trim() + "Your persona is " + agent.persona + " and your goal is " + agent.goal
        }
    })
    agentsNodes.push({
        type: "singleAgent",
        description: "Aggregator",
        tools: [],
        llm: "gpt-4o-mini",
        taskPrompt: taskPrompt,
        patternPrompt: aggregation.patternPrompt?.trim() || aggregatorPatternSystemPrompt,
        systemPrompt: taskPrompt + aggregation.patternPrompt?.trim()
    })

    let agentsEdges = []

    for (let i = 1; i <= agents.length; i++) {
        agentsEdges.push({
            type: "direct",
            source: "START",
            target: `Agent${i}`,
            label: "start",
        })
        agentsEdges.push({
            type: "direct",
            source: `Agent${i}`,
            target: "Aggregator",
            label: "direct",
        })
    }
    agentsEdges.push({
        type: "direct",
        source: "Aggregator",
        target: "__end__",
        label: "finish",
    })
    
    return {
        type: "parallel",
        nodes: [...agentsNodes],
        edges: agentsEdges,
        maxRound: maxRound,
    }
}

const handleSingleAgent = (step) => {
    const { stepDescription, template } = step;
    const { persona, goal, patternPrompt , maxRound} = template;
    const taskPrompt = 'The task description for you is ' + stepDescription;
    const patternSystemPrompt = 'You are a helpful assistant who can efficiently solve the task.';
    return {
        type: "singleAgent",
        maxRound: 1,
        nodes: [
            {
                type: "singleAgent",
                description: "Agent",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: patternPrompt?.trim() || patternSystemPrompt,
                systemPrompt: patternPrompt + taskPrompt + "Your persona is " + persona + " and your goal is " + goal
            }
        ],
        edges: []
    };
};

const handleValidator = (step) => {
    const { stepDescription, template } = step;
    const { persona, goal, patternPrompt , maxRound} = template;
    const taskPrompt = 'The task description for you is ' + stepDescription;
    const patternSystemPrompt = 'You are a helpful assistant who can validate the content of the response.';
    return {
        type: "singleAgent",
        maxRound: 1,
        nodes: [
            {
                type: "singleAgent",
                description: "Agent",
                tools: [],
                llm: "gpt-4o-mini",
                taskPrompt: taskPrompt,
                patternPrompt: patternPrompt?.trim() || patternSystemPrompt,
                systemPrompt: patternPrompt + taskPrompt + "Your persona is " + persona + " and your goal is " + goal
            }
        ],
        edges: []
    };
};


const handlersMap = {
    "Web Search Agent": handleSingleAgentWithWebSearchTool,
    "PDF Loader Agent": handleSingleAgentWithPDFLoaderTool,
    "Reflection": handleReflection,
    "Supervision": handleSupervision,
    "Discussion": handleDiscussion,
    "Single Agent": handleSingleAgent,
    "Voting": handleVoting,
    "Parallel": handleParallel,
    "Validator": handleValidator,
};

export { handlersMap };