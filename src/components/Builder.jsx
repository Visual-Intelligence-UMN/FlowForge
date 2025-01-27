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
import { taskFlowsGenerateAtom, patternsGenerateAtom, patternsFlowAtom, patternsAtom, agentsConfigGenerateAtom, agentsConfigPatternAtom, agentsConfigAtom, compiledConfigsAtom, compliedGenerateAtom } from '../global/GlobalStates';

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

    // generate inital task flows if the task is selected
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