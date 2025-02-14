import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  selectedConfigAtom,
  reactflowGenerateAtom,
  langgraphGenerateAtom,
  agentsConfigAtom,
  agentsConfigGenerateAtom,
  agentsConfigPatternAtom,
  selectionChainAtom,
} from "../../global/GlobalStates";

import GenerateRunnableConfig from "../GenerateConfig";
import { Box, Card, CardContent, Typography, Button, Paper, IconButton, Menu, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";


const patternIdToConfigCounter = {};

function reassignConfigIds(patternId, configs) {
  if (!patternIdToConfigCounter[patternId]) {
    patternIdToConfigCounter[patternId] = 1;
  }

  return configs.map((config) => {
    const nextCount = patternIdToConfigCounter[patternId]++;
    return {
      ...config,
      originalConfigId: config.configId,
      configId: `${patternId}-${nextCount}`,
      patternId,
    };
  });
}

const AgentsPanel = () => {
  const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
  const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
  const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);

  const [selectedAgentConfig, setSelectedAgentConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
  const [reactflowGenerate, setReactflowGenerate] = useAtom(reactflowGenerateAtom);
  const [langgraphGenerate, setLanggraphGenerate] = useAtom(langgraphGenerateAtom);

  const [selectionChain, setSelectionChain] = useAtom(selectionChainAtom);

  // generateAgents => reassign config IDs
  const generateAgents = async (pattern) => {
    const generatedAgentsConfig = await GenerateRunnableConfig(pattern);
    // Reassign each config’s ID
    const assignedConfigs = reassignConfigIds(pattern.patternId, generatedAgentsConfig);
    // Merge into the global agentsConfig
    setAgentsConfig((previousAgentsConfig) => {
      const updatedAgentsConfig = [];
      let replaced = false;
      for (const config of previousAgentsConfig) {
        if (config.patternId === pattern.patternId && config.configId === pattern.configId && !replaced) {
          updatedAgentsConfig.push(...assignedConfigs);
          replaced = true;
        } else {
          updatedAgentsConfig.push(config);
        }
      }
      if (!replaced) {
        updatedAgentsConfig.push(...assignedConfigs);
      }
      return updatedAgentsConfig;
    });
    setAgentsConfigGenerate(-1);
    setAgentsConfigPattern(null);
  };


  const deleteConfig = (configId) => {
    setAgentsConfig((prev) => prev.filter((c) => c.configId !== configId));
  };

  // top-right menu
  const ConfigMenu = ({ configId }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
      event.stopPropagation(); // Prevent card click from selecting it
      setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleDelete = (event) => {
      event.stopPropagation();
      deleteConfig(configId);
      handleMenuClose();
    };

    return (
      <>
        <IconButton
          aria-label="more"
          onClick={handleMenuOpen}
          sx={{ position: "absolute", top: 8, right: 8, p: 0, m: 1}}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </>
    );
  };

  
  useEffect(() => {
    if (agentsConfigGenerate === 0 && agentsConfigPattern) {
      generateAgents(agentsConfigPattern);
    }
  }, [agentsConfigGenerate, agentsConfigPattern]);

  const NoAgents = () => (
     <p className="hint">No agents available. Please generate agents for the selected pattern.</p>
  );


  // handleSelectConfig => triggers ReactFlow, LangGraph
  const handleSelectConfig = (config) => {
    setReactflowGenerate(0);
    setLanggraphGenerate(0);
    setSelectedConfig(config);
  };

  const isAgentConfigSelected = (config) => {
    if (selectionChain.configId && config.configId === selectionChain.configId) {
      return true;
    }
    if (!selectionChain.configId && selectionChain.patternId) {
      return config.patternId.startsWith(selectionChain.patternId);
    }
    if (!selectionChain.patternId && selectionChain.flowId) {
      return config.patternId.startsWith(selectionChain.flowId+"-");
    }
    return false;
  };

  const AgentsConfigDisplay = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {agentsConfig.map((config) => (
        <Grid item xs={12} sm={6} md={4} key={config.configId} sx={{ position: "relative" }}>
          <Card
            onClick={() => {
              setSelectedAgentConfig(config);
              const [flowId, patternNum, cfgNum] = config.patternId.split("-");
              setSelectionChain({
                flowId,
                patternId: `${flowId}-${patternNum}`, 
                configId: config.configId
              });
            }}
            sx={{
              border: isAgentConfigSelected(config) ? "2px solid blue" : "1px solid #ccc",
              backgroundColor: isAgentConfigSelected(config) ? "#f0f8ff" : "#fff",
              cursor: "pointer",
              transition: "0.3s",
              "&:hover": { boxShadow: 6 },
            }}
          >
            {/* Config menu in top-right */}
            <ConfigMenu configId={config.configId} />
            <CardContent>
              {/* For debugging, config.configId */}
              <Typography variant="h6" gutterBottom color="primary">
                Config {config.configId}
              </Typography>
              {config.taskFlowSteps?.map((step, idx) => (
                <Paper
                  key={`${config.configId}-step-${idx}`}
                  elevation={2}
                  sx={{ padding: 1, marginTop: 1, borderLeft: "4px solid #3f51b5" }}
                >
                  <Typography variant="subtitle1">{step.stepName}</Typography>
                  <Typography variant="caption">{step.pattern?.name}</Typography>
                </Paper>
              ))}
              <Button
                color="primary"
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

  const AgentsConfigDisplayRows = () => {
    return (
      <Grid container sx={{mt: 1, p: 0}} spacing={0}>
        {agentsConfig.map((config) => (
          <Box key={config.configId} sx={{ flex: "0 0 auto", position: "relative", xs: 12}}>
            <Card
              onClick={() => {
                setSelectedAgentConfig(config);
                const [flowId, patternNum, cfgNum] = config.patternId.split("-");
                setSelectionChain({
                  flowId,
                  patternId: `${flowId}-${patternNum}`,
                  configId: config.configId,
                });
              }}
              sx={{
                border: isAgentConfigSelected(config)
                  ? "2px solid blue"
                  : "1px solid #ccc",
                backgroundColor: isAgentConfigSelected(config) ? "#f0f8ff" : "#fff",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { boxShadow: 6 },
                p: 0,
                m: 1,
              }}
            >
              {/* Config menu in top-right */}
              <ConfigMenu configId={config.configId} />
              <CardContent sx={{p: 0, "&:last-child": { pb: 0 }}}>
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{m: 0}}>
                    Config {config.configId}
                  </Typography>
                  <Button
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectConfig(config);
                    }}
                    sx={{ mt: 0 , p: 1, ml: 5}}
                  >
                    CONTINUE
                  </Button>
                </Box>
  
                {/* Steps in a row as well */}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mt: 0 , p: 0.5}}>
                  {config.taskFlowSteps?.map((step, idx) => (
                    <Paper key={`${config.configId}-step-${idx}`} 
                    sx={{ p: 0.5, borderLeft: "2px solid #3f51b5", m: 0, lineHeight: 0.8}}>
                      <Typography variant="subtitle1" sx={{p: 0}}>{step.stepName}</Typography>
                      <Typography variant="caption" sx={{p: 0, m: 0}}>{step.pattern?.name}</Typography>
                    </Paper>
                  ))}
                </Box>
  
                
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 1, paddingTop: 4}}>
      <h3>
        Agents Configurations
      </h3>
      {agentsConfig.length > 0 ? <AgentsConfigDisplayRows /> : <NoAgents />}
    </Box>
  );
};

export default AgentsPanel;
