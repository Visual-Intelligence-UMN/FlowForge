import { Box, Card, CardContent, Typography, Button, Paper, IconButton, Menu, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid2";

const PageConfigs = ({config , setSelectedConfig, setCompliedGenerate}) => {
    const { configId, taskFlowSteps } = config;

    const configDisplay = () => (
        <Box key={config.configId} sx={{ flex: "0 0 auto", position: "relative", xs: 12, m: 1}}>
        <Card
          sx={{
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
            transition: "0.3s",
            "&:hover": { boxShadow: 6 },
            p: 0,
            m: 1,
          }}
        >
          {/* Config menu in top-right */}
          {/* <ConfigMenu configId={config.configId} /> */}
          <CardContent sx={{p: 0, "&:last-child": { pb: 0 }}}>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <Typography variant="h6" gutterBottom color="primary" sx={{m: 0}}>
                Config {config.configId}
              </Typography>
              <Button
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedConfig(config);
                  setCompliedGenerate(0);
                }}
                sx={{ mt: 0 , p: 1, ml: 5}}
              >
                CONTINUE
              </Button>
            </Box>

            {/* Steps in a row as well */}
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, mt: 0 , p: 0.5}}>
              {config.taskFlowSteps?.map((step, idx) => (
                <Paper key={`${config.configId}-step-${idx}`} 
                sx={{ p: 0.5, borderLeft: "2px solid #3f51b5", m: 0, lineHeight: 0.8}}>
                  <Typography variant="subtitle1" sx={{p: 0}}>{step.stepName}</Typography>
                  <Typography variant="caption" sx={{p: 0, m: 0}}>{step.pattern?.name}</Typography>
                </Paper>
              ))}
            </Box>

            
          </CardContent>
        </Card>
      </Box>
    );

    return (
        <div>   
            {configDisplay()}
        </div>
    );
}

export default PageConfigs;