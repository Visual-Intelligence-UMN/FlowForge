import CompileReactflow from "./CompileReactflow";
import CompileLanggraph from "./CompileLanggraph";

const OrganizeReactflow = async (config, setCompiledConfigs) => {
    // console.log("config to compile all", config);
    const compiledReactflow = await CompileReactflow(config);
    // console.log("compiledReactflow", compiledReactflow);
    const { runnableLanggraph, totalMaxRound } = await CompileLanggraph(compiledReactflow);
    const compiledConfig = {
        reactflowDisplay: compiledReactflow, 
        langgraphRun: runnableLanggraph, 
        configId: config.configId,
        totalMaxRound: totalMaxRound,
    };
    // update the compiled configs
    setCompiledConfigs((previousCompiledConfigs) => {
        const updatedCompiledConfigs = [];
        let replaced = false;
        for (const cfg of previousCompiledConfigs) {
            if (cfg.configId === config.configId && !replaced) {
                updatedCompiledConfigs.push(compiledConfig);
                replaced = true;
            } else {
                updatedCompiledConfigs.push(cfg);
            }
        }
        if (!replaced) {
            updatedCompiledConfigs.push(compiledConfig);
        }
        return updatedCompiledConfigs;
    });
}

export default OrganizeReactflow;