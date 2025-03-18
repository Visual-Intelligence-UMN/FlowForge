import GenerateRunnableConfig from "./GenerateConfig";

const patternIdToConfigCounter = {};

function reassignConfigIds(patternId, agentsConfig, configs) {
  // console.log("agentsConfig", agentsConfig);
  patternIdToConfigCounter[patternId] = agentsConfig?.filter(config => config.patternId === patternId).length + 1;

  return configs.map((config) => {
    const nextCount = patternIdToConfigCounter[patternId]++;
    return {
      ...config,
      configId: `${patternId}-${nextCount}`,
      patternId,
    };
  });
}

const OrganizeConfig = async (pattern, agentsConfig, setAgentsConfig) => {
  console.log("agentsConfig input", agentsConfig);
  console.log("pattern to organize", pattern);
  const generatedAgentsConfig = await GenerateRunnableConfig(pattern);
  // Reassign each config’s ID
  const assignedConfigs = reassignConfigIds(
    pattern.patternId,
    agentsConfig,
    generatedAgentsConfig
  );
  console.log("new assignedConfigs", assignedConfigs);
 

  setAgentsConfig((previousAgentsConfig) => {
    const updatedAgentsConfig = [];
    let replaced = false;
    for (const config of previousAgentsConfig) {
      if (config.patternId === pattern.patternId && !replaced) {
        updatedAgentsConfig.push(...assignedConfigs);
        replaced = true;
      } else {
        updatedAgentsConfig.push(config);
      }
    }
    if (!replaced) {
      updatedAgentsConfig.push(...assignedConfigs);
    }
    // console.log("newly updatedAgentsConfig list", updatedAgentsConfig);
    return updatedAgentsConfig;
  });
};

export default OrganizeConfig;
