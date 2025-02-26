
// design patterns pool
export const designPatternsPool = [
    {
        name: "Web Search Agent",
        description: "This design pattern has a single agent to perform the task, and have the access to the web search tool to search for information.\
        It is useful when the task requires the agent to search for information on the web.",
    },
    {
        name: "PDF Loader Agent",
        description: "This design pattern has a single agent to perform the task, and have the access to the PDF loader tool to load the PDF files.\
        It is useful when the task requires the agent to read and understand the PDF files.",
    },
    {
        name: "Single Agent",
        description: "This design pattern has a single agent to perform the task, and it is useful when the task is not too complex.",
    }, 
    {
        name: "Validator",
        description: "Agent evaluator can perform testing to assess the agent regarding diverse requirements and metrics.",
    },
    {
        name: "Reflection",
        description: "This design pattern has a pair of agents, one is the main agent, and the other is the reflection agent. \
        The main agent is the one performing the task, and the reflection agent is the one observing and deciding the main agent's performance and providing iterative feedback to the main agent to improve its performance.\
        It is useful when the task is not too complex but requires iterations to get the best result.",
    },
    {
        name: "Discussion",
        description: "This design pattern has three agents with different personas or jobs or roles, \
        and they are debating and discussing multiple ideas, brainstorming, and generating diverse perspectives.\
        It is useful when the task requires creativity and diversity of perspectives.",
    },
    {
        name: "Parallel",
        description: "work simultaneously on a task and have their outputs aggregated programmatically. ",
    },
    {
        name: "Voting",
        description: "Agents with diverse identities can freely provide their opinions and reach consensus through voting-based cooperation.",
    },
    {
        name: "Supervision",
        description: "This design pattern has a supervisor agent, and two worker agents.\
        The supervisor agent is the one observing and routing the tasks to the worker agents,\
        and worker agents are the ones performing the tasks.\
        It is useful when the task has several focus points, and each focus point can be handled by a different worker agent.",
    }

]

export const designPatternsTemplate = {
    "Single Agent": {
        confirm: false,
        persona: "Single Agent",
        goal: "Single Agent",
    }, 
    "Validator": {
        confirm: false, 
        persona: "Validator",
        goal: "Validator",
        patternPrompt: "You are a validator. You are given a task and a set of requirements. You need to validate the task based on the requirements.",
    },
    "Supervision": {
        confirm: false,
        workerNum: 2,
        maxRound: 10,
        workers: [
            {
                persona: "Worker",
                goal: "Worker",
                patternPrompt: "You are a helpful assistant who can finish the task.",
            },
            {
                persona: "Worker",
                goal: "Worker",
                patternPrompt: "You are a helpful assistant who can finish the task.",
            },
        ],
        supervisor: {
            persona: "Supervisor",
            goal: "Supervisor",
            patternPrompt: "You are a helpful supervisor who can coordinate the workers to complete the task. \
            Given the user request and conversation history, respond with the worker to act next. Each agent will perform a subtask and respond with their restuls and status.\
            When the task is done, you should organize the output and respond with ending with FINISH.",
        },
    },
    "Reflection": {
        confirm: false,
        maxRound: 10,
        evaluator: {
            persona: "Evaluator",
            goal: "Evaluator",
            patternPrompt: `You are a helpful reviewer who can analyze the output of another agent. 
                    You work with another agent to solve the task and iterate on the output. You provide subtle and helpful feedbacks.
                    You should always include the final output from the worker agent in your response first. Then, 
                    If the output is not good enough, you should respond with feedbacks and suggestions for improvement after the output from the worker agent, and ask the agent to improve the output, and add NOT GOOD at the end.
                    If the output is good enough, you should only respond the final output from the worker agent, and add APPROVED at the end. `
        },
        optimizer: {
            persona: "Optimizer",
            goal: "Optimizer",
            patternPrompt: `You are a helpful assistant who can work with reviewer agent to achieve a task. 
            You should always read and input first if there is any. You can efficiently improve the output based on the feedbacks and suggestions provided by the reviewer. 
            You work with the reviewer and iterate on the output until it is good enough.`,
        },    
    },
    "Discussion": {
        confirm: false,
        maxRound: 10,
        withSummary: true,
        agents: [
            {
                persona: "scientist",
                goal: "more logical and scientific",
                patternPrompt: "'You are a helpful assistant who can discuss with other agents to brainstorm and generate ideas';"
            },
            {
                persona: "journalist",
                goal: "more realistic and engaging",
                patternPrompt: "'You are a helpful assistant who can discuss with other agents to brainstorm and generate ideas';"
            },
            {
                persona: "artist",
                goal: "more artistic and creative",
                patternPrompt: "'You are a helpful assistant who can discuss with other agents to brainstorm and generate ideas';"
            },
        ],
        summary: {
            persona: "Summary",
            goal: "Summary",
            patternPrompt: 'You are a helpful assistant who can summarize the output of the agents.',
        },
    },
    "Parallel": {
        confirm: false,
        withAggregation: true,
        agents: [
            {
                persona: "scientist",
                goal: "more logical and scientific",
                patternPrompt: 'You are a helpful assistant who finish the task.'
            },
            {
                persona: "journalist",
                goal: "more realistic and engaging",
                patternPrompt: 'You are a helpful assistant who finish the task.'
            },
            
        ],
        aggregation: {
            persona: "Aggregator",
            goal: "Aggregator",
            patternPrompt: 'You are a helpful assistant who can aggregate the output of the agents.',
        },
    },
    "Voting": {
        confirm: false,
        withAggregation: true,
        maxRound: 10,
        agents: [
            {
                persona: "scientist",
                rubric: "Ideas towards more logical and scientific, target audience is the scientific community",
                patternPrompt: 'You are a helpful assistant who can vote and score based on the rubric'
            },
            {
                persona: "journalist",
                rubric: "Ideas towards more realistic and engaging, target audience is the general public",
                patternPrompt: 'You are a helpful assistant who can vote and score based on the rubric'
            },
            {
                persona: "artist",
                rubric: "Ideas towards more artistic and creative, target audience is the future art",
                patternPrompt: 'You are a helpful assistant who can vote and score based on the rubric'
            },
        ],
        aggregation: {
            persona: "Aggregator",
            goal: "Aggregator",
            patternPrompt: 'You are a helpful assistant who can aggregate the scores of the voting agents.',
        },
    },
}
