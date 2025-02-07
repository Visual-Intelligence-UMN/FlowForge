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
    const { stepDescription } = step;
    const patternSystemPromptReview = 'You are a helpful reviewer who can analyze the output of another agent. \
    You work with another agent to solve the task and iterate on the output. You provide subtle and helpful feedbacks.\
    You should always include the final output from the worker agent in your response first. Then, \
    If the output is not good enough, you should respond with feedbacks and suggestions for improvement after the output from the worker agent, and ask the agent to improve the output, and add NOT GOOD at the end.\
    If the output is good enough, you should only respond the final output from the worker agent, and add APPROVED at the end.';

    const patternSystemPromptWork = 'You are a helpful assistant who can work with reviewer agent to achieve a task. \
    You should always read and input first if there is any. \
    You can efficiently improve the output based on the feedbacks and suggestions provided by the reviewer. \
    You work with the reviewer and iterate on the output until it is good enough.';

    const taskPrompt =  'The task description for you is ' + stepDescription;

    return {
        type: "reflection",
        nodes: [
            {
                type: "executor",
                description: "Executor",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: taskPrompt + patternSystemPromptWork
            },
            {
                type: "reviewer",
                description: "Reviewer",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: taskPrompt + patternSystemPromptReview
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
    const { stepDescription, pattern} = step;
    const taskPrompt = 'The task for the team is' + stepDescription;    

    // TODO: parse the pattern description to get the members information
    const members_description = [pattern.description.split(',')] as const;
    const members = [pattern.description.split(',')] as const;

    const taskPromptAgentA = 'The task for you is' + stepDescription;
    const taskPromptAgentB = 'The task for you is' + stepDescription;

    const patternSystemPromptAgentA = 'You are a helpful assistant who can achieve the task';
    const patternSystemPromptAgentB = 'You are a helpful assistant who can achieve the task';

    const patternSystemPromptSupervisor = 'You are a helpful supervisor who can supervise other agents to achieve the task \
    You manage the conversation between the following agents: {members}.  \
    Given the user request and conversation history, respond with the worker to act next. Each agent will perform a subtask and respond with their restuls and status. \
    When the task is done, you should organize the output and respond with ending with FINISH.';

    // TODO: additional information: 
    // With the following members description: {members_description}.

    return {
        type: "supervision",
        members: members,
        members_description: members_description,
        nodes: [
            {
                type: "supervisor",
                description: "Supervisor",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPromptSupervisor + taskPrompt
            }, 
            {
                type: "singleAgent",
                description: "AgentA",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPromptAgentA + taskPromptAgentA
            },
            {
                type: "singleAgent",
                description: "AgentB",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPromptAgentB + taskPromptAgentB
            }
        ],
        edges: [
            {
                type: "direct",
                source: "START",
                target: "Supervisor",
                label: "start",
            },
            {
                type: "conditional",
                source: "Supervisor",
                target: "AgentA",
                label: "route task",
            },
            {
                type: "conditional",
                source: "Supervisor",
                target: "AgentB",
                label: "route task",
            },
            {
                type: "direct",
                source: "AgentA",
                target: "Supervisor",
                label: "respond",
            },
            {
                type: "direct",
                source: "AgentB",
                target: "Supervisor",
                label: "respond",
            },
            {
                type: "conditional",
                source: "Supervisor",
                target: "END",
                label: "finish",
            }
        ]
    };
};

const handleDiscussion = (step) => {
    const { stepDescription, pattern} = step;
    const taskPrompt = 'The task for the team is' + stepDescription;
    const patternSystemPrompt = 'You are a helpful assistant who can discuss with other agents to brainstorm and generate ideas';
    return {
        type: "discussion",
        nodes: [
            {
                type: "singleAgent",
                description: "Agent",
                tools: [],
                llm: "gpt-4o-mini",
                systemPrompt: patternSystemPrompt + taskPrompt
            }
        ],
        edges: []
    };
};

const handleSingleAgent = (step) => {
    const { stepDescription } = step;
    const systemPrompt = 'The task description for you is ' + stepDescription;
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
                systemPrompt: patternSystemPrompt + systemPrompt
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
};

export { handlersMap };