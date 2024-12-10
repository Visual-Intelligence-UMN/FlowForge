import { useAtom } from "jotai";
import { agentsConfigAtom, agentsConfigGenerateAtom, agentsConfigPatternAtom } from "../global/GlobalStates";
import { useEffect, useState } from "react";
import { selectedConfigAtom, reactflowGenerateAtom } from "../global/GlobalStates";
const AgentsPanel = () => {
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const [selectedAgentConfig, setSelectedAgentConfig] = useState(null);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
    const generateAgents = async (pattern) => {
        console.log("Generating agents for pattern:", pattern);
        setAgentsConfigGenerate(0);
        const exampleAgentsConfig = [
            {
                taskId: pattern.taskId,
                flowId: pattern.flowId,
                patternId: pattern.patternId,
                agentConfigId: 1,
                description: "Agents Configuration",
                agents: [
                    {
                        agentId: 1,
                        name: "Agent 1",
                        description: "Agent 1 description",
                        tools: ["tool1", "tool2"],
                        systemPrompt: "System prompt for agent 1"
                    },
                    {
                        agentId: 2,
                        name: "Agent 2",
                        description: "Agent 2 description",
                        tools: ["tool1", "tool2"],
                        systemPrompt: "System prompt for agent 2"
                    }
                ],
                agentsConnect: [
                    {
                        source: 1,
                        target: 2,
                        agentConnectType: "agentConnectType1",
                        agentConnectDescription: "Agent connect description"
                    }
                ]
            }
        ]
        setAgentsConfig(previousAgentsConfig => {
            const updatedAgentsConfig = [];
            let replaced = false;
            for (const agent of previousAgentsConfig) {
                if (agent.taskId === pattern.taskId && agent.flowId === pattern.flowId && agent.patternId === pattern.patternId) {
                    if (!replaced) {
                        updatedAgentsConfig.push(...exampleAgentsConfig);
                        replaced = true;
                    }
                } else {
                    updatedAgentsConfig.push(agent);
                }
            }
            if (!replaced) {
                updatedAgentsConfig.push(...exampleAgentsConfig);
            }
            return updatedAgentsConfig;
        });

        setAgentsConfigGenerate(-1);
        setAgentsConfigPattern(null);
    };

    useEffect(() => {
        if (agentsConfigGenerate === 0) {
            generateAgents(agentsConfigPattern);
        }
    }, [agentsConfigGenerate]);

    const NoAgents = () => {
        return <p>No agents available. Please generate agents for the selected pattern.</p>;
    };

    const handleSelectConfig = (config) => {
        setReactflowGenerate(0);
        setSelectedConfig(config);
        console.log("Selected config:", config);
    }

    const AgentsDisplay = () => {
        return (
            <div className="agents-config-container">
                {agentsConfig.map((config) => (
                    <div className="agents-config"
                        onClick={() => setSelectedAgentConfig(config)}
                        style={{
                            border: selectedAgentConfig === config ? "2px solid blue" : "1px solid #ccc",
                            backgroundColor: selectedAgentConfig === config ? "#f0f8ff" : "#fff",
                        }}
                    >
                        <div className="agents-config-details">
                            {config.description}
                            {config.agents.map((agent, idx) => (
                            <div key={agent.agentId}>
                                <br/>
                                {agent.name}
                                <br/>
                                {agent.description}
                                <br/>
                                {agent.systemPrompt}
                            </div>
                        ))}
                        </div>
                        <button onClick={() => handleSelectConfig(config)}>ReactFlow</button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="agents-panel">
            <h2>Agents</h2>
            {agentsConfig.length > 0 ? <AgentsDisplay/> : <NoAgents/>}
        </div>
    );
};

export default AgentsPanel;