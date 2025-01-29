import TreeNav from './TreeNav';
import SharedCanvas from './SharedCanvas';
import { Box } from '@mui/material';
import OrganizeTaskFlows from './OrganizeTaskFlows';
import OrganizePatterns from './OrganizePatterns';
import OrganizeConfig from './OrganizeConfig';
import OrganizeReactflow from './OrganizeReactflow';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskAtom, flowsMapAtom, flowIdsAtom, selectedConfigAtom } from '../global/GlobalStates';
import { taskFlowsGenerateAtom, patternsGenerateAtom, patternsFlowAtom, patternsAtom, agentsConfigGenerateAtom, agentsConfigPatternAtom, agentsConfigAtom, compiledConfigsAtom, compliedGenerateAtom, canvasPagesAtom , treeNavAtom } from '../global/GlobalStates';

const Builder = () => {
    // atoms for task flows 
    const [selectedTask] = useAtom(selectedTaskAtom);
    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [flowIds, setFlowIds] = useAtom(flowIdsAtom);
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);

    // atoms for patterns
    const [patternsGenerate, setPatternsGenerate] = useAtom(patternsGenerateAtom);
    const [patternsFlow, setPatternsFlow] = useAtom(patternsFlowAtom);
    const [designPatterns, setDesignPatterns] = useAtom(patternsAtom);

    // atoms for agents config
    const [agentsConfig, setAgentsConfig] = useAtom(agentsConfigAtom);
    const [agentsConfigGenerate, setAgentsConfigGenerate] = useAtom(agentsConfigGenerateAtom);
    const [agentsConfigPattern, setAgentsConfigPattern] = useAtom(agentsConfigPatternAtom);

    const [selectedConfig, setSelectedConfig] = useAtom(selectedConfigAtom);
    const [compiledConfigs, setCompiledConfigs] = useAtom(compiledConfigsAtom);
    const [compliedGenerate, setCompliedGenerate] = useAtom(compliedGenerateAtom);

    // atoms for canvas pages
    const [canvasPages, setCanvasPages] = useAtom(canvasPagesAtom);
    const [treeNav, setTreeNav] = useAtom(treeNavAtom);

    useEffect(() => {
        if (taskFlowsGenerate === 0) {
            OrganizeTaskFlows(selectedTask, flowsMap, setFlowsMap, flowIds, setFlowIds);
            setTaskFlowsGenerate(1);
        }
    }, [taskFlowsGenerate]);

    useEffect(() => {
        if (patternsGenerate === 0 && patternsFlow) {
            OrganizePatterns(patternsFlow, setDesignPatterns);
            setPatternsGenerate(1);
            setPatternsFlow(null);
        }
    }, [patternsGenerate, patternsFlow]);

    useEffect(() => {
        if (agentsConfigGenerate === 0 && agentsConfigPattern) {
            OrganizeConfig(agentsConfigPattern, setAgentsConfig);
            setAgentsConfigGenerate(1);
            setAgentsConfigPattern(null);
        }
    }, [agentsConfigGenerate, agentsConfigPattern]);

    useEffect(() => {
        if (compliedGenerate === 0 && selectedConfig) {
            OrganizeReactflow(selectedConfig, setCompiledConfigs);
            setCompliedGenerate(1);
            setSelectedConfig(null);
        }
    }, [compliedGenerate, selectedConfig]);

    useEffect(() => {
        if (taskFlowsGenerate === 1 && flowIds.length > 0) {
            const randomFlow = flowsMap[flowIds[Math.floor(Math.random() * flowIds.length)]];
            setCanvasPages({
                type: "flow",
                flowId: randomFlow.taskFlowId,
                patternId: [],
                configId: [],
            });
        }
    }, [taskFlowsGenerate]);

    useEffect(() => {
        if (canvasPages.type === "flow" && designPatterns.length > 0) {
            const newAddedPatterns = designPatterns.filter(pattern => pattern.patternId.split("-")[0] === canvasPages.flowId.toString());
            const randomPattern = newAddedPatterns[Math.floor(Math.random() * newAddedPatterns.length)];
            setCanvasPages({
                type: "pattern",
                flowId: canvasPages.flowId,
                patternId: randomPattern.patternId,
                configId: [],
            });
        }
    }, [designPatterns]);

    useEffect(() => {
        if (canvasPages.type === "pattern" && agentsConfig.length > 0) {
            const newAddedConfigs = agentsConfig.filter(config => config.patternId.split("-")[0] === canvasPages.flowId.toString() && config.patternId === canvasPages.patternId.toString());
            const randomConfig = newAddedConfigs[Math.floor(Math.random() * newAddedConfigs.length)];
            setCanvasPages({
                type: "config",
                flowId: canvasPages.flowId,
                patternId: canvasPages.patternId,
                configId: randomConfig.configId,
            });
        }
    }, [agentsConfig]);

    useEffect(() => {
        if (canvasPages.type === "config" && compiledConfigs.length > 0) {
            const newAddedConfigs = compiledConfigs.filter(config => config.configId === canvasPages.configId.toString());
            const randomConfig = newAddedConfigs[Math.floor(Math.random() * newAddedConfigs.length)];
            setCanvasPages({
                type: "compiled",
                flowId: canvasPages.flowId,
                patternId: canvasPages.patternId,
                configId: randomConfig.configId,
            });
        }
    }, [compiledConfigs]);

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "row", gap: 3}}>
            <Box sx={{ width: "30%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <TreeNav />
            </Box>
            <Box sx={{ width: "60%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <SharedCanvas />
            </Box>
        </Box>
    );
};

export default Builder;