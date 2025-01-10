import { designPatternsPool } from "../global/GlobalStates";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tooltip 
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import HomeIcon from "@mui/icons-material/Home";

const PatternsMapRow = () => {
  return (
    <Box sx={{ mb: 1, ml: 1 }} >
      {designPatternsPool.map((pattern, index) => (
        <Grid item xs="auto" key={index} spacing={2} sx={{ padding: 1 }}>
          <Tooltip title={pattern.description} arrow>
            <Card
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 4 },
                padding: 1,
              }}
            >
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } } } >
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "left", 
                    height: "100%" 
                  }}
                >
                  <HomeIcon fontSize="small" sx={{ mr: 1}} />
                  <Typography variant="body2" textAlign="center">
                    {pattern.name}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      ))}
    </Box>
  );
};

export default PatternsMapRow;
