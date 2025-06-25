import CallReceivedIcon from '@mui/icons-material/CallReceived';
import SendIcon from '@mui/icons-material/Send';
import { Tooltip } from "@mui/material";

const iconWrapperStyle = { margin: "0 8px" ,   display: 'inline-flex',
  alignItems: 'center', 
};
const stopDrag = (e: React.PointerEvent) => e.stopPropagation();

type IOProps = {
  active?: boolean;
};

export const InputIO: React.FC<IOProps> = ({ active = false }) => {
  return (
    <Tooltip
      title="Receives input from previous step"
      arrow
      placement="top"
      className="nodrag nopan nowheel"
    >
      <span
        className="nodrag nopan nowheel"
        style={iconWrapperStyle}
        onPointerDown={stopDrag}
      >
        <CallReceivedIcon
          fontSize="small"
          sx={{ color: active ? 'info.main' : 'grey.800' }}
        />
      </span>
    </Tooltip>
  );
};

export const OutputIO: React.FC<IOProps> = ({ active = false }) => {
  return (
    <Tooltip
      title={active ? 'Sends output to next step' : 'Candidate agent sends outputs to next step'}
      arrow
      placement="top"
      className="nodrag nopan nowheel"
    >
      <span
        className="nodrag nopan nowheel"
        style={iconWrapperStyle}
        onPointerDown={stopDrag}
      >
        <SendIcon
          fontSize="small"
          sx={{ color: active ? 'info.main' : 'grey.800' }}
        />
      </span>
    </Tooltip>
  );
};
