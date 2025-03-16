import { Box, Typography } from "@mui/material";

const LoadingFlows = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid #ddd",
          width: "100%",
          height: "70vh",
          color: "grey",
        }}
      >
        <Typography 
            variant="h8" 
            sx={{ 
                pt: 2 
            }}
        >
          Flows are generating...
        </Typography>
      </Box>
    );
  };

  const LoadingPatterns = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid #ddd",
          width: "100%",
          height: "70vh",
          color: "grey",
        }}
      >
        <Typography 
            variant="h8" 
            sx={{ 
                pt: 2 
            }}
        >
          Patterns are generating...
        </Typography>
      </Box>
    );
  };

export default LoadingFlows;