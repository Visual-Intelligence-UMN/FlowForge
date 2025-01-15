
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
        name: "Reflection",
        description: "This design pattern has a pair of agents, one is the main agent, and the other is the reflection agent. \
        The main agent is the one performing the task, and the reflection agent is the one observing and deciding the main agent's performance and providing iterative feedback to the main agent to improve its performance.\
        It is useful when the task is not too complex but requires iterations to get the best result.",
    },
    {
        name: "Supervision",
        description: "This design pattern has a supervisor agent, and two worker agents.\
        The supervisor agent is the one observing and routing the tasks to the worker agents,\
        and worker agents are the ones performing the tasks.\
        It is useful when the task has several focus points, and each focus point can be handled by a different worker agent.",
    },
    {
        name: "Discussion",
        description: "This design pattern has three agents with different personas or jobs or roles, \
        and they are debating and discussing multiple ideas, brainstorming, and generating diverse perspectives.\
        It is useful when the task requires creativity and diversity of perspectives.",
    },
    {
        name: "Single Agent",
        description: "This design pattern has a single agent to perform the task, and it is useful when the task is not too complex.",
    }
]