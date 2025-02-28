import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { iconMap } from "../../global/iconsMap";
import { designPatternsPool } from "../../global/patternsMap";
const PatternsMap = () => {
  return (
    <Box sx={{
       mb: 1, ml: 1,
       backgroundColor: "#f5f5f5",
       }}>
      {Object.keys(iconMap).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap[pattern] || HomeIcon;
        return (
          <Grid container item xs="auto" key={index} spacing={2} sx={{ p:1 }}>
            <Tooltip 
            title={designPatternsPool[index].description} 
            sx={{width: "240px", fontSize: "26px"}}
            arrow>
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 4 },
                  p: 1,
                  m: 1.5,
                  width: "240px",
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 0 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                    }}
                  >
                    {/* Render the dynamic icon */}
                    <IconComponent sx={{ mr: 1}}/>
                    <Typography variant="subtitle1" textAlign="left" sx={{fontSize: "18px"}}>
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

const PatternsMapRow = () => {
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


export { PatternsMap, PatternsMapRow };