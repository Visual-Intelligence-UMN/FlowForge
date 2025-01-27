import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { iconMap } from "../global/iconsMap";

const PatternsMap = () => {
  return (
    <Box sx={{ mb: 1, ml: 1, 
    display: "flex", flexDirection: "row", gap: 0, 
    }}>
      {Object.keys(iconMap).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap[pattern] || HomeIcon;
        return (
          <Grid container item xs="auto" key={index} spacing={2} sx={{ p: 0.5 }}>
            <Tooltip title={pattern.description} arrow>
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 4 },
                  p: 0.5,
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                    }}
                  >
                    {/* Render the dynamic icon */}
                    <IconComponent fontSize="small" sx={{ mr: 1 }}/>
                    <Typography variant="body2" textAlign="center">
                      {pattern}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        );
      })}
    </Box>
  );
};


export default PatternsMap;