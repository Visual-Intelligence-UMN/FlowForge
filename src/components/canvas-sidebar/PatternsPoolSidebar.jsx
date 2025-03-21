import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { iconMap1, iconMap2, iconMap3 } from "../../images/iconsMap";
import { designPatternsPool } from "../../patterns/patternsData";
const PatternsMap2 = () => {
  return (
    <Box
      sx={{
        mb: 1,
        ml: 1,
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      {Object.keys(iconMap2).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap2[pattern] || HomeIcon;
        return (
          <Grid container item xs="auto" key={index}>
            <Tooltip
              title={designPatternsPool[index].description}
              sx={{ width: "240px", fontSize: "26px" }}
              arrow
            >
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 4 },
                  p: 0.5,
                  ml: 1.5,
                  mr: 1.5,
                  mt: 1,
                  width: "100%",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                    }}
                  >
                    {/* Render the dynamic icon */}
                    <IconComponent />
                    <Typography
                      variant="subtitle1"
                      textAlign="left"
                      sx={{ fontSize: "12px", ml: 1 }}
                    >
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

const PatternsMap1 = () => {
  return (
    <Box
      sx={{
        mb: 1,
        ml: 1,
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      {Object.keys(iconMap1).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap1[pattern] || HomeIcon;
        return (
          <Grid container item xs="auto" key={index}>
            <Tooltip
              title={designPatternsPool[index].description}
              sx={{ width: "240px", fontSize: "26px" }}
              arrow
            >
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 4 },
                  p: 0.5,
                  ml: 1.5,
                  mr: 1.5,
                  mt: 1,
                  width: "100%",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                    }}
                  >
                    {/* Render the dynamic icon */}
                    <IconComponent />
                    <Typography
                      variant="subtitle1"
                      textAlign="left"
                      sx={{ fontSize: "12px", ml: 1 }}
                    >
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

const PatternsMap3 = () => {
  return (
    <Box
      sx={{
        mb: 1,
        ml: 1,
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      {Object.keys(iconMap3).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap3[pattern] || HomeIcon;
        return (
          <Grid container item xs="auto" key={index}>
            <Tooltip
              title={designPatternsPool[index].description}
              sx={{ width: "240px", fontSize: "26px" }}
              arrow
            >
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": { boxShadow: 4 },
                  p: 0.5,
                  ml: 1.5,
                  mr: 1.5,
                  mt: 1,
                  width: "100%",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                    }}
                  >
                    {/* Render the dynamic icon */}
                    <IconComponent />
                    <Typography
                      variant="subtitle1"
                      textAlign="left"
                      sx={{ fontSize: "12px", ml: 1 }}
                    >
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
    <Box sx={{ mb: 1, ml: 1, display: "flex", flexDirection: "row", gap: 0 }}>
      {Object.keys(iconMap).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap[pattern] || HomeIcon;
        return (
          <Grid
            container
            item
            xs="auto"
            key={index}
            spacing={2}
            sx={{ p: 0.5 }}
          >
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
                    <IconComponent fontSize="small" sx={{ mr: 1 }} />
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

export { PatternsMap1, PatternsMap2, PatternsMap3, PatternsMapRow };
