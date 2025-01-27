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
        <Box sx={{ width: "100%", display: "flex", flexDirection: "row", marginTop: "100px", border: "1px solid #ccc"}}>
            <TreeNav />
            <SharedCanvas />
        </Box>
    );
};

export default Builder;