import { useAtom } from "jotai";
import { patternsAtom, patternsGenerateAtom, patternsFlowAtom } from "../global/GlobalStates";
import { useEffect } from "react";
import { agentsConfigGenerateAtom, agentsConfigPatternAtom } from "../global/GlobalStates";

const PatternsPanel = () => {
    const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const generatePatterns = async (flow) => {
        console.log("Generating patterns for flow with ID:", flow);
        const examplePatterns = [{
            taskId: flow.taskId,
            flowId: flow.flowId,
            patternId: Math.floor(Math.random() * 1000000),
            name: "Pattern 1",
            description: "Pattern 1 description",
            nodes: flow.nodes,
            edges: flow.edges
        }, 
        {
            taskId: flow.taskId,
            flowId: flow.flowId,
            patternId: Math.floor(Math.random() * 1000000),
            name: "Pattern 2",
            description: "Pattern 2 description",
            nodes: flow.nodes,
            edges: flow.edges
        }
        ]
        setDesignPatterns(previousPatterns => {
            const updatedPatterns = [];
            let replaced = false;
            for (const pattern of previousPatterns) {
                if (pattern.taskId === flow.taskId && pattern.flowId === flow.flowId) {
                    if (!replaced) {
                        updatedPatterns.push(...examplePatterns);
                        replaced = true;
                    }
                } else {
                    updatedPatterns.push(pattern);
                }
            }
            if (!replaced) {
                updatedPatterns.push(...examplePatterns);
            }
    
            return updatedPatterns;
        });
        setPatternsGenerate(-1);
        setPatternsFlow(null);
    };

    useEffect(() => {
        if (patternsGenerate === 0) {
            generatePatterns(patternsFlow);
        }
    }, [patternsGenerate]);


    const NoPatterns = () => {
        return <p>No patterns available. Please generate patterns for the selected flow.</p>;
    };

    const configureAgents = (pattern) => {
        setAgentsConfigGenerate(0);
        setAgentsConfigPattern(pattern);
        console.log("Configuring agents for pattern:", pattern);
    };

    const PatternsDisplay = () => {
        return (
            <div className="patterns-container">
                {designPatterns.map((pattern) => (
                    <div className="pattern-display" >
                        Task Flow {pattern.flowId}
                        
                        <div className="pattern-details">
                            <br/>
                            {pattern.name}
                            <br/>
                            {pattern.description}
                            <br/>
                            {pattern.nodes.join(", ")}
                            <br/>
                            {pattern.edges.join(", ")}
                        </div>
                        <button onClick={() => configureAgents(pattern)}>Continue</button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="patterns-panel">
            <h2>Patterns</h2>
            {designPatterns.length > 0 ? <PatternsDisplay/> : <NoPatterns/>}
        </div>
    );
};

export default PatternsPanel;