import CompileReactflow from "./CompileReactflow";
import CompileLanggraph from "./CompileLanggraph";

const OrganizeReactflow = async (config, setCompiledConfigs) => {
    const compiledReactflow = await CompileReactflow(config);
    console.log("compiledReactflow", compiledReactflow);
    const runnableLanggraph = await CompileLanggraph(compiledReactflow);
    const compiledConfig = {reactflow: compiledReactflow, langgraph: runnableLanggraph, configId: config.configId};
    setCompiledConfigs((previousCompiledConfigs) => {
        const updatedCompiledConfigs = [];
        let replaced = false;
        for (const cfg of previousCompiledConfigs) {
            if (cfg.configId === compiledConfig.configId && !replaced) {
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