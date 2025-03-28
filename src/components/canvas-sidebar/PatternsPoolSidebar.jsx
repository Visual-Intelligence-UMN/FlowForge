import { Box, Card, CardContent, Typography, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { iconMap1, iconMap2, iconMap3 } from "../../images/iconsMap";

const PatternsMap2 = () => {
  return (
    <Box
      sx={{
        p: 1,
        // m: 1,
        backgroundColor: "#f5f5f5",
        height: "100%",
      }}
    >
      {Object.keys(iconMap2).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap2[pattern].icon || HomeIcon;
        return (
          <Grid container item xs="auto" key={index}
            bgcolor="white"
            sx={{
              borderRadius: "10px",
              border: "1px solid #e0e0e0",
              fontSize: "10px",
              cursor: "pointer",
              "&:hover": { boxShadow: 2, border: "2px solid #e0e0e0", },
              '&:hover .hover-text': {
                display: 'block',
              },
              '.hover-text': {
                display: 'none',
              },
              p: 0.5,
              m: 1
            }}
          >

            <Typography
              variant="subtitle1"
              textAlign="center"
              sx={{ fontSize: "14px" }}
            >
              {pattern}
            </Typography>
            <IconComponent />
            <p className='hover-text'>
              {iconMap2[pattern].description}
            </p>
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
        const IconComponent = iconMap1[pattern].icon || HomeIcon;
        return (
          <Grid xs="auto" key={index}
            bgcolor="white"
            sx={{
              borderRadius: "10px",
              border: "1px solid #e0e0e0",
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              fontSize: "10px",
              cursor: "pointer",
              "&:hover": { boxShadow: 2, border: "2px solid #e0e0e0", },
              '&:hover .hover-text': {
                display: 'block',
              },
              '.hover-text': {
                display: 'none',
              },
              p: 0.5,
              m: 1
            }}
          >
            {/* <Tooltip
              title={designPatternsTooltip[index].description}
              sx={{ width: "200px", fontSize: "16px" }}
              arrow
            > */}
            <Typography
              variant="subtitle1"
              textAlign="center"
              sx={{ fontSize: "10px" }}
            >
              {pattern}
            </Typography>
            <IconComponent />
            <p className='hover-text'>
              {iconMap1[pattern].description}
            </p>
            {/* </Tooltip> */}
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
        p: 1
      }}
    >
      {Object.keys(iconMap3).map((pattern, index) => {
        // If the iconType isn't found in iconMap, use HomeIcon (or any fallback)
        const IconComponent = iconMap3[pattern].icon || HomeIcon;
        return (
          <Grid container item xs="auto" key={index}>

            <Grid
              sx={{
                borderRadius: "2px",
                border: "1px solid #e0e0e0",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                fontSize: "10px",
                cursor: "pointer",
                "&:hover": { boxShadow: 2, border: "2px solid #e0e0e0", },
                '&:hover .hover-text': {
                  display: 'block',
                },
                '.hover-text': {
                  display: 'none',
                },
                p: 0.5,
                m: 0.5
              }}
            >

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
              <p className='hover-text'>
                {iconMap3[pattern].description}
              </p>

            </Grid>
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
