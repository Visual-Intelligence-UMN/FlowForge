import TreeNav from './TreeNav';
import SharedCanvas from './SharedCanvas';
import { Box } from '@mui/material';

const Builder = () => {
    return (
        <Box sx={{ display: "flex", flexDirection: "row", marginTop: "100px"}}>
            <TreeNav />
            <SharedCanvas />
        </Box>
    );
};

export default Builder;