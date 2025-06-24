import { Handle, Position } from "@xyflow/react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import { designPatternsPool } from "../../../patterns/patternsData";
import { designPatternsTemplate } from "../../../patterns/patternsData";
import { SingleAgentForm } from "../../templates/template-agent/SingleAgentForm";
import { SupervisionForm } from "../../templates/template-supervision/SupervisionForm";
import { ValidatorForm } from "../../templates/template-validator/ValidatorForm";
import { ReflectionForm } from "../../templates/template-reflection/ReflectionForm";
import { DiscussionForm } from "../../templates/template-discussion/DiscussionForm";
import { RedundantForm } from "../../templates/template-redundant/RedundantForm";
import { VotingForm } from "../../templates/template-voting/VotingForm";
import { PatternIcons } from "../../canvas-patterns/PatternIcons";
import Icon from "@mui/material/Icon";
import { iconMap2 } from "../../../images/iconsMap";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { calculateCost } from "./helpers";
import { useState, useEffect } from "react";

export const FlowWithPatternsNode = ({ data, isConnectable, id }) => {
  if (!id) {
    // console.log("FlowWithPatternsNode id", id);
  }
  const { updateNodeFieldset } = data;
  const showContentZoom = data.showContent;
  const hovered = data.hoveredPattern === data.pattern.name ? true : false;
  const [showContent, setShowContent] = useState(false);
  const [showContentClick, setShowContentClick] = useState(false);
  // const showContent = false;
  const patternName = data.pattern?.name || "";
  const template = data.template || {};
  // // console.log("template", template);

  useEffect(() => {
    if (showContentZoom && showContentClick) {
      // console.log("showContentZoom", showContentZoom);
      // console.log("showContentClick", showContentClick);
      setShowContent(false);
    } else if (!showContentZoom && showContentClick) {
      // console.log("showContentZoom", showContentZoom);
      // console.log("showContentClick", showContentClick);
      setShowContent(showContentZoom);
    } else if (!showContentZoom && !showContentClick) {
      // console.log("showContentZoom", showContentZoom);
      // console.log("showContentClick", showContentClick);
      setShowContent(showContentZoom);
    } else if (showContentZoom && !showContentClick) {
      // console.log("showContentZoom", showContentZoom);
      // console.log("showContentClick", showContentClick);
      setShowContent(showContentZoom);
    }
  }, [showContentZoom, showContentClick]);


  const handleSelectPattern = (event) => {
    const chosenName = event.target.value;
    const chosenTemplate = designPatternsTemplate[chosenName] || {};

    updateNodeFieldset(id, "pattern.name", chosenName);
    updateNodeFieldset(id, "template", chosenTemplate);
  };

  const onChangeTemplate = (newData) => {
    updateNodeFieldset(id, "template", newData);
  };

  const patternForm = () => {
    switch (patternName) {
      case "Single Agent":
        return (
          <SingleAgentForm data={data.template} onChange={onChangeTemplate} />
        );
      case "Supervision":
        return (
          <SupervisionForm data={data.template} onChange={onChangeTemplate} />
        );
      case "Validator":
        return (
          <ValidatorForm data={data.template} onChange={onChangeTemplate} />
        );
      case "Reflection":
        return (
          <ReflectionForm data={data.template} onChange={onChangeTemplate} />
        );
      case "Discussion":
        return (
          <DiscussionForm data={data.template} onChange={onChangeTemplate} />
        );
      case "Redundant":
        return (
          <RedundantForm data={data.template} onChange={onChangeTemplate} />
        );
      // case "Voting":
      //   return <VotingForm data={data.template} onChange={onChangeTemplate} />;
      default:
        return (
          <SingleAgentForm data={data.template} onChange={onChangeTemplate} />
        );
    }
  };

  const patternWidthMap = {
    "Single Agent": showContent ? [200, 450] : [200, 450],
    Supervision: showContent ? [566, 750] : [330, 450],
    Validator: showContent ? [450, 450] : [330, 450],
    Reflection: showContent ? [566, 450] : [330, 450],
    Discussion: showContent ? [566, 750] : [330, 450],
    Redundant: showContent ? [566, 750] : [330, 450],
    // "Voting": showContent ? [666, 700] : [333, 450],
    "PDF Loader Agent": showContent ? [450, 450] : [230, 450],
    "Web Search Agent": showContent ? [450, 450] : [230, 450],
    default: [100, 100],
  };

  const patternSelect = (
    <Select
      label="Pattern"
      value={patternName}
      onChange={handleSelectPattern}
      size="small"
      sx={{
        fontSize: "30px",
        marginBottom: 1,
        maxWidth: 250,
        backgroundColor: hovered ? "#e3f2fd" : "#fff",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#90caf9",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#42a5f5",
        },
      }}
      className="nodrag nopan"
    >
      {/* {designPatternsPool.map((pattern) => (
        <MenuItem
          key={pattern.name}
          value={pattern.name}
          sx={{
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {pattern.name} <span>{}</span>
        </MenuItem>
      ))} */}
      <MenuItem
        key="Single Agent"
        value="Single Agent"
        sx={{
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        Single Agent
      </MenuItem>
      {Object.keys(iconMap2).map((patternName) => (
        <MenuItem
          key={patternName}
          value={patternName}
          sx={{
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {patternName}
          <span style={{
            backgroundColor: iconMap2[patternName].color,
            marginRight: '2px', marginLeft: '2px',
            padding: '0px 4px',
            width: '20px'
          }}>
            {iconMap2[patternName].shortName}
          </span>
        </MenuItem>
      ))}
    </Select>
  );


  const taskDescription = (
    <Typography
      variant="body1"
      sx={{
        fontSize: "20px",
        mb: 1,
        ml: 2,
        textAlign: "left",
      }}
    >
      <b>Task Description:</b> {data.stepDescription}
    </Typography>
  );

  const iconsDisplay = (
    <Box
      className="level2-patterns inside icon"
      sx={{
        opacity: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: hovered ? "#e3f2fd" : "#fff",
      }}
    >
      <PatternIcons pattern={data.pattern} template={data.template} />
    </Box>
  );


  const stepLabel = (
    <Typography
      sx={{
        fontWeight: "bold",
        fontSize: "35px",
        m: 0,
      }}
    >
      {data.stepLabel}
    </Typography>
  );

  const { calls, runtime, calls_number } = calculateCost(
    data.pattern,
    data.template
  );

  const decomposeCalls = (calls: string) => {

    // Remove whitespace
    const cleanExpr = calls.replace(/\s+/g, '');
    // Split by operators (+, -, *, /, parentheses, etc.)
    const parts = cleanExpr.split(/[\+\-\*\/\(\)]+/);
    // Filter out empty strings
    return parts.filter(p => p.length > 0);
  }

  let [A_, B_, C_] = decomposeCalls(calls);
  let A = A_ ? parseInt(A_) : 1;
  let B = B_ ? parseInt(B_) : 1;
  let C = C_ ? parseInt(C_) : 0;

  const callCharts = <svg width={15 * A + 15} height={B * 15}>
    {Array.from({ length: A }, (_, i) => (
      <g key={i} transform={`translate(${i * 15}, 0)`}>
        {Array.from({ length: B }, (_, j) => (
          <rect key={`${i}-${j}`} x={0} y={B * 15 - (j + 1) * 15} width="12" height="12" fill={iconMap2[patternName] ? iconMap2[patternName].color : 'lightgray'} />
        ))}
      </g>
    ))}
    <g transform={`translate(${A * 15}, 0)`}>
      {Array.from({ length: C }, (_, i) => (
        <rect key={`C-${i}`} width={12} height={12} x={0} y={B * 15 - (i + 1) * 15} fill={iconMap2[patternName] ? iconMap2[patternName].color : 'lightgray'} />

      ))}
    </g>
  </svg>

  const computationCost = (
    <Typography
      sx={{
        fontSize: "20px",
      }}
    >
      {showContent && callCharts}
      <br />
      {showContent
        ? `${calls} = ${calls_number} LLM calls`
        : `${calls_number} LLM calls`}
    </Typography>
  );

  const placeholder =
    "This pattern is suitable because it optimizes cost and efficiency.";
  const explanation = (
    <Tooltip
      title={data.pattern.recommendationReason || placeholder}
      arrow
      placement="right"
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: "150px",
          },
        },
      }}
    >
      <InfoOutlinedIcon color="primary" />
    </Tooltip>
  );

  return (
    <Box
      sx={{
        padding: 0.5,
        // border: "1px solid #ddd",
        borderRadius: 1,
        backgroundColor: hovered ? "#fff" : "#fff",
        minWidth: patternWidthMap[patternName]?.[0] || 100,
        textAlign: "center",
        maxWidth: patternWidthMap[patternName]?.[1] || 100,
        boxShadow: 2,
        gap: 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`in-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "blue" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`out-${id}`}
        isConnectable={isConnectable}
        style={{ top: "50%", background: "#555" }}
      />

      <Typography sx={{ backgroundColor: iconMap2[patternName] ? iconMap2[patternName].color : 'white' }} onClick={() => setShowContentClick(!showContentClick)}> {stepLabel}</Typography>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          gap: 2,
          padding: 1,
          // justifyContent: "space-between", // Evenly distribute elements horizontally
          alignItems: "center", // Align items vertically
          justifyContent: "center",
        }}
      >
        {patternSelect}
        {explanation}
      </Box>

      {showContent && taskDescription}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          pl: 2,
          pr: 2,
        }}
      >
        {iconsDisplay}
        {computationCost}
        {/* {explanation()} */}
      </Box>

      {showContent ? (
        <Box
          sx={{
            maxWidth: "100%",
            backgroundColor: data.template.confirm ? "#e3f2fd" : "#fff",
            transition: "all 0.3s ease-in-out",
            opacity: 1,
          }}
        >
          {patternForm()}
        </Box>
      ) : (
        <Box
          sx={{
            transition: "all 0.3s ease-in-out",
            opacity: 1,
          }}
        >
          {/* <PatternIcons pattern={data.pattern} template={data.template} /> */}
        </Box>
      )}
    </Box>
  );
};
