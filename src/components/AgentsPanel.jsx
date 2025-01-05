import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { selectedConfigAtom, reactflowGenerateAtom, langgraphGenerateAtom } from "../global/GlobalStates";
import GenerateRunnableConfig from "./GenerateConfig";
import { agentsConfigAtom, agentsConfigGenerateAtom, agentsConfigPatternAtom } from "../global/GlobalStates";
import { Box, Card, CardContent, Typography, Button, Paper } from "@mui/material";
import Grid from '@mui/material/Grid2';

const AgentsPanel = () => {
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const [selectedAgentConfig, setSelectedAgentConfig] = useState(null);
    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
    const [langgraphGenerate, setLanggraphGenerate] = useAtom(langgraphGenerateAtom);
    const generateAgents = async (pattern) => {
        const generatedAgentsConfig = await GenerateRunnableConfig(pattern);
        console.log("Generated agents config:", generatedAgentsConfig);

        setAgentsConfig(previousAgentsConfig => {
            const updatedAgentsConfig = [];
            let replaced = false;
            for (const config of previousAgentsConfig) {
                // TODO: make sure to display the correct agents config corresponding to the pattern
                if (config.patternId === pattern.patternId) {
                    if (!replaced) {
                        updatedAgentsConfig.push(...generatedAgentsConfig);
                        replaced = true;
                    }
                } else {
                    updatedAgentsConfig.push(config);
                }
            }

            if (!replaced) {
                updatedAgentsConfig.push(...generatedAgentsConfig);
            }
            console.log("Updated agents config:", updatedAgentsConfig);
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

    const NoAgents = () => (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
            No agents available. Please generate agents for the selected pattern.
        </Typography>
    );

    const handleSelectConfig = (config) => {
        setReactflowGenerate(0);
        setLanggraphGenerate(0);
        setSelectedConfig(config);
    };

    const AgentsDisplay = () => (
        <Grid container spacing={2} sx={{ mt: 2 }}>
            {agentsConfig.map((config, configIdx) => (
                <Grid item xs={12} sm={6} md={4} key={configIdx}>
                    <Card 
                        onClick={() => setSelectedAgentConfig(config)}
                        sx={{
                            border: selectedAgentConfig === config ? "2px solid blue" : "1px solid #ccc",
                            backgroundColor: selectedAgentConfig === config ? "#f0f8ff" : "#fff",
                            cursor: "pointer",
                            transition: "0.3s",
                            "&:hover": { boxShadow: 6 }
                        }}
                    >
                        <CardContent>

                            {config.taskFlowSteps.map((step, idx) => (
                                <Paper key={`${configIdx}-${idx}`} 
                                    elevation={2} 
                                    sx={{ padding: 1, marginTop: 1, borderLeft: "4px solid #3f51b5" }}
                                >
                                    <Typography variant="subtitle1">{step.stepName}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Nodes: {step.config.nodes.length}
                                    </Typography>
                                    {step.config.nodes.map((node, idx) => (
                                        <Typography variant="caption" color="text.secondary" key={`${configIdx}-${idx}-${idx}`}>
                                            {node.description}
                                        </Typography>
                                    ))}
                                    <Typography variant="caption" color="text.secondary">
                                        Edges: {step.config.edges.length}
                                    </Typography>
                                    {step.config.edges.map((edge, idx) => (
                                        <Typography variant="caption" color="text.secondary" key={`${configIdx}-${idx}-${idx}`}>
                                            {edge.source} - {edge.target}
                                        </Typography>
                                    ))}
                                </Paper>
                            ))}

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent click event
                                    handleSelectConfig(config);
                                }}
                                sx={{ mt: 2 }}
                            >
                                CONTINUE
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Agents
            </Typography>
            {agentsConfig.length > 0 ? <AgentsDisplay /> : <NoAgents />}
        </Box>
    );
};

export default AgentsPanel;
