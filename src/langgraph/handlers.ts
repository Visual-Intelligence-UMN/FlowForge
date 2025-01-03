const handleSingleAgentWithWebSearchTool = (pattern) => {

    return {
        nodes: [
            {
                agentId: 1,
                name: "Agent 1",
                description: "Agent 1 description",
                tools: ["tool1"],
                systemPrompt: "System prompt for agent 1"
            }
        ],
        edges: []
    };
};

const handleSingleAgentWithPDFLoaderTool = (pattern) => {
    return {
        nodes: [],
        edges: []
    };
};

const handleReflection = (pattern) => {
    return {
        nodes: [],
        edges: []
    };
};

const handleSupervision = (pattern) => {
    return {
        nodes: [],
        edges: []
    };
};

const handleDiscussion = (pattern) => {
    return {
        nodes: [],
        edges: []
    };
};

const handleSingleAgent = (pattern) => {
    return {
        nodes: [
            {
                agentId: 1,
                name: "Agent 1",
                description: "Agent 1 description",
                tools: ["tool1"],
                systemPrompt: "System prompt for agent 1"
            }
        ],
        edges: []
    };
};

export { handleSingleAgentWithWebSearchTool, handleSingleAgentWithPDFLoaderTool, handleReflection, handleSupervision, handleDiscussion, handleSingleAgent };