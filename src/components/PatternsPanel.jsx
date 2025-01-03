import { useAtom } from "jotai";
import { patternsAtom, patternsGenerateAtom, patternsFlowAtom } from "../global/GlobalStates";
import { useEffect } from "react";
import { agentsConfigGenerateAtom, agentsConfigPatternAtom } from "../global/GlobalStates";
import GeneratePatterns from "./GeneratePatterns";
import randomCombinePatterns from "./CombinePatterns";
import React from "react";
import { Box, Card, CardContent, Typography, Button, Divider } from "@mui/material";
import Grid from '@mui/material/Grid2';
import DisplayPatterns from "./DisplayPatterns";

const PatternsPanel = () => {
    const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);
    const generatePatterns = async (flow) => {
        // const patternsFlow = await GeneratePatterns(flow);
        // const examplePatterns = randomCombinePatterns(patternsFlow, 2);

        // TODO: remove this after testing the patterns generation
        const examplePatterns = [{
            taskId: flow.taskFlowId,
            taskFlowId: flow.taskFlowId + "1",
            taskFlowName: flow.taskFlowName,
            patternId: Math.floor(Math.random() * 1000000),
            taskFlowSteps: flow.taskFlowSteps
        }, 
        {
            taskId: flow.taskFlowId,
            taskFlowId: flow.taskFlowId + "2",
            taskFlowName: flow.taskFlowName,
            patternId: Math.floor(Math.random() * 1000000),
            taskFlowSteps: flow.taskFlowSteps
        }
        ]

        setDesignPatterns(previousPatterns => {
            const updatedPatterns = [];
            let replaced = false;
            for (const pattern of previousPatterns) {
                if (pattern.taskFlowId === flow.taskFlowId) {
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

    // const PatternsDisplay = () => {
    //     return (
    //         <div className="patterns-container">
    //             {designPatterns.map((pattern) => (
    //                 <div className="pattern-display" >
    //                     Task Flow {pattern.taskFlowId}
    //                         {pattern.taskFlowSteps.map((step) => (
    //                             <div className="pattern-details">
    //                                 <p>{step.stepName}</p>
    //                                 <p>{step.pattern.name}</p>
    //                             </div>
    //                         ))}
    //                         <br/>
    //                     <button onClick={() => configureAgents(pattern)}>Continue</button>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };
    const PatternsDisplay = () => {
        return (
          <Box sx={{ p:1, backgroundColor: "#f5f5f5" }}>
            <Grid container spacing={1}>
              {designPatterns.map((pattern) => (
                <Grid item xs={12} sm={6} md={4} key={pattern.patternsId}>
                  <Card elevation={3} sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Task Flow {pattern.patternsId}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {pattern.taskFlowSteps.map((step, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {step.stepName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.pattern.name}
                          </Typography>
                        </Box>
                      ))}
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => configureAgents(pattern)}
                        sx={{ mt: 2 }}
                      >
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      };
    
    const Display = () => {
        return (
           <Box sx={{ p:1, backgroundColor: "#f5f5f5" }}>   
            <Grid container spacing={1}>
                {designPatterns.map((pattern) => (
                    <Grid item xs={12} key={pattern.patternsId}>
                        <DisplayPatterns designPatterns={pattern}/>
                    </Grid>
                ))}
        
            </Grid>
            </Box>
        );
    };
    
    return (
        <div className="patterns-panel">
            <h2>Patterns</h2>
            {designPatterns.length > 0 ? <PatternsDisplay/> : <NoPatterns/>}
            {designPatterns.length > 0 ? <Display/> : <NoPatterns/>}
        </div>
    );
};

export default PatternsPanel;