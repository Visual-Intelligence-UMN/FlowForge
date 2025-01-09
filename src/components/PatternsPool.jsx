import { designPatternsPool } from "../global/GlobalStates";
import { 
    Box, 
    Card, 
    CardContent, 
    Typography,
    Tooltip,
  } from "@mui/material";
  import Grid from "@mui/material/Grid2";

const PatternsMapRow = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {designPatternsPool.map((pattern, index) => (
            <Grid item xs="auto" key={index}>
              <Tooltip title={pattern.description} arrow>
                <Card
                  sx={{
                    width: 200,
                    height: 30,
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 4,
                    },
                    padding: 1,
                  }}
                >
                  <CardContent sx={{ padding: 0, margin: 0 }} >
                    <Typography
                      variant="body2"
                      textAlign="center"
                      sx={{
                        whiteSpace: "wrap",
                        width: "100%",
                      }}
                    >
                      {pattern.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
};

export default PatternsMapRow;