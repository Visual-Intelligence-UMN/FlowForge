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
} from "../global/GlobalStates";

import GenerateRunnableConfig from "./GenerateConfig";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Paper, 
  IconButton, 
  Menu, 
  MenuItem 
} from "@mui/material";
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

  const deleteConfig = (configId) => {
    setAgentsConfig((prev) => prev.filter((c) => c.configId !== configId));
    console.log("Deleting config with ID:", configId);
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
          sx={{ position: "absolute", top: 8, right: 8 }}
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

  // generateAgents => reassign config IDs
  const generateAgents = async (pattern) => {
    const generatedAgentsConfig = await GenerateRunnableConfig(pattern);
    console.log("Generated agents config:", generatedAgentsConfig);

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

      console.log("Updated agents config:", updatedAgentsConfig);
      return updatedAgentsConfig;
    });

    // Mark generation complete
    setAgentsConfigGenerate(-1);
    setAgentsConfigPattern(null);
  };

  useEffect(() => {
    if (agentsConfigGenerate === 0 && agentsConfigPattern) {
      generateAgents(agentsConfigPattern);
    }
  }, [agentsConfigGenerate, agentsConfigPattern]);

  const NoAgents = () => (
     <p>No agents available. Please generate agents for the selected pattern.</p>
  );


  // handleSelectConfig => triggers ReactFlow, LangGraph
  const handleSelectConfig = (config) => {
    setReactflowGenerate(0);
    setLanggraphGenerate(0);
    setSelectedConfig(config);
    console.log("Selected config for next step:", config);
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

  const AgentsDisplay = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {agentsConfig.map((config) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          key={config.configId} // Use our newly assigned config ID as the key
          sx={{ position: "relative" }}
        >
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

  return (
    <Box sx={{ padding: 1 ,border: '1px solid #ccc', paddingTop: 4}}>
      <Typography variant="h5" fontWeight="bold">
        Flows with Configurations
      </Typography>
      {agentsConfig.length > 0 ? <AgentsDisplay /> : <NoAgents />}
    </Box>
  );
};

export default AgentsPanel;
