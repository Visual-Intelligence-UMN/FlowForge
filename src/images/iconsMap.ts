// Import all the icons you need
import { collapseClasses } from "@mui/material";
import { 
    DiscussionIcon, 
    ParallelIcon,
    VotingIcon,
    ValidatorIcon,
    SupervisionIcon,
    ReflectionIcon,
    WebsearchIcon, 
    AgentIcon,
    ParallelTaskIcon,
    SequentialTaskIcon,
    PromptIcon,
    RagIcon
} from "./Icons";

const ColorPalette = [
  "#FCD5B5", // light orange
  "#F7B6B8", // light red/coral
  "#C6E8C3", // light green
  "#E4C9E7", // light lavender
  "#D2EAE7", // light teal
  "#FDE4C8", // soft peach
  "#D6E3F3", // icy blue
  "#FBE2E6",  // blush pink
  "#C6D8EB", // light blue
];


export const iconMap2 = {
    // "Single Agent": AgentIcon,
    // "Web Search Agent": WebsearchIcon,
    // "PDF Loader Agent": PersonIcon,
    // "Validator": ValidatorIcon,
    "Reflection": {
      'icon': ReflectionIcon, 
      description: "A feedback loop where one agent generates and optimizes the response while another evaluates it, until criterion is met (quality or max iteration). Example: Refining drafts.  Optimizer recieves input, and Evaluator sends output to the next step.",
      'color':ColorPalette[0],
      shortName: 'RF'
},
    "Discussion": {
      'icon': DiscussionIcon,
      'color':ColorPalette[1], 
       shortName: 'D',
      description: "A group of agents engage in a conversation, where they take turns speaking in a round-robin, random manner, or simultaneously. Extra agent to summarize is optional Example: Brainstorming ideas. Agent#1 recieves input, and one of the agents or Summarizer sends output to the next step."
   },
    "Redundant": {
      description: "Multiple agents simultaneously attempt on the same input, but adopting different personas, or perspectives, yielding diverse outputs that can be aggregated. Example: Comprehensive content reviews. All agents recieves input, and Aggregator sends output to the next step.", 
      'icon': ParallelIcon,
      'color':ColorPalette[2],
       shortName: 'RD'
    },
    // "Voting": VotingIcon,
    "Supervision": {
      description: "A hierarchical structure where a central agent dynamically decide which worker agents to act based on the current generated output. Example: Content refinement.  Supervisor recieves input, and one of the agents sends output to the next step.",
      'icon':SupervisionIcon,
      'color':ColorPalette[3],
       shortName: 'S'
    },
    // any other icons ...
  };

  export const iconMap1 = {
    "Sequential": {description: "subtasks operate in a fixed order, passing results from one to the next.", 'icon':SequentialTaskIcon, color:ColorPalette[4]},
    "Parallel": {description: "Multiple subtasks run simultaneously.", 'icon':ParallelTaskIcon, color:ColorPalette[5]},
  };

  export const iconMap3 = {
    "Tool Use": {description: 'An agent invokes external tools', 'icon':WebsearchIcon, color:ColorPalette[6]},
    "Prompting": {description: '', 'icon':PromptIcon , color:ColorPalette[7]},
    "Data Retrieval": {description: 'An agent retrieves relevant information from a data store or knowledge base', 'icon': RagIcon,  color:ColorPalette[8]},
  };

