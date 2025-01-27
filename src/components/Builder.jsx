import TreeNav from './TreeNav';
import SharedCanvas from './SharedCanvas';
import { Box } from '@mui/material';
import OrganizeTaskFlows from './OrganizeTaskFlows';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskAtom, flowsMapAtom, flowIdsAtom } from '../global/GlobalStates';
import { taskFlowsGenerateAtom } from '../global/GlobalStates';

const Builder = () => {
    const [selectedTask] = useAtom(selectedTaskAtom);
    const [flowsMap, setFlowsMap] = useAtom(flowsMapAtom);
    const [flowIds, setFlowIds] = useAtom(flowIdsAtom);
    const [taskFlowsGenerate, setTaskFlowsGenerate] = useAtom(taskFlowsGenerateAtom);

    // generate inital task flows if the task is selected
    useEffect(() => {
        if (taskFlowsGenerate === 0) {
            OrganizeTaskFlows(selectedTask, flowsMap, setFlowsMap, flowIds, setFlowIds);
            setTaskFlowsGenerate(1);
        }
    }, [taskFlowsGenerate]);



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