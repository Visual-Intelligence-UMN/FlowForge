import GenerateRunnableConfig from "./GenerateConfig";

const patternIdToConfigCounter = {};

function reassignConfigIds(patternId, configs) {
  if (!patternIdToConfigCounter[patternId]) {
    patternIdToConfigCounter[patternId] = 1;
  }

  return configs.map((config) => {
    const nextCount = patternIdToConfigCounter[patternId]++;
    return {
      ...config,
      configId: `${patternId}-${nextCount}`,
      patternId,
    };
  });
}

const OrganizeConfig = async (pattern, setAgentsConfig) => {
  console.log("pattern to organize", pattern);
    const generatedAgentsConfig = await GenerateRunnableConfig(pattern);
       // Reassign each config’s ID
    const assignedConfigs = reassignConfigIds(pattern.patternId, generatedAgentsConfig);
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
      
}

export default OrganizeConfig;