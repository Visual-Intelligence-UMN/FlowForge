
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
        persona: "Single Agent",
        goal: "Single Agent",
    }, 
    "Validator": {
        persona: "Validator",
        goal: "Validator",
    },
    "Supervision": {
        workerNum: 2,
        maxRound: 10,
        workers: [
            {
                persona: "Worker",
                goal: "Worker",
            },
            {
                persona: "Worker",
                goal: "Worker",
            },
        ],
        supervisor: {
            persona: "Supervisor",
            goal: "Supervisor",
        },
    },
    "Reflection": {
        maxRound: 10,
        evaluator: {
            persona: "Evaluator",
            goal: "Evaluator",
        },
        optimizer: {
            persona: "Optimizer",
            goal: "Optimizer",
        },    
    },
    "Discussion": {
        maxRound: 10,
        agentNum: 3,
        withSummary: true,
        agents: [
            {
                persona: "scientist",
                goal: "more logical and scientific",
            },
            {
                persona: "journalist",
                goal: "more realistic and engaging",
            },
            {
                persona: "artist",
                goal: "more artistic and creative",
            },
        ],
        summary: {
            persona: "Summary",
            goal: "Summary",
        },
    },
    "Parallel": {
        agentNum: 3,
        withSummary: true,
        agents: [
            {
                persona: "Agent",
                goal: "Agent",
            },
        ],
        summary: {
            persona: "Summary",
            goal: "Summary",
        },
    },
    "Voting": {
        agentNum: 3,
        withSummary: true,
        agents: [
            {
                persona: "scientist",
                goal: "more logical and scientific",
            },
            {
                persona: "journalist",
                goal: "more realistic and engaging",
            },
            {
                persona: "artist",
                goal: "more artistic and creative",
            },
        ],
        summary: {
            persona: "Summary",
            goal: "Summary",
        },
    },
}
