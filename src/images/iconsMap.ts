// Import all the icons you need
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


export const iconMap2 = {
    // "Single Agent": AgentIcon,
    // "Web Search Agent": WebsearchIcon,
    // "PDF Loader Agent": PersonIcon,
    // "Validator": ValidatorIcon,
    "Reflection": {'icon': ReflectionIcon, description: "A feedback loop where one agent generates and optimizes the response while another evaluates it, until criterion is met (quality or max iteration). Example: Refining drafts."
},
    "Discussion": {'icon': DiscussionIcon, description: "A group of agents engage in a conversation, where they take turns speaking in a round-robin, random manner, or simultaneously. Extra agent to summarize is optional Example: Brainstorming ideas."
   },
    "Redundant": {description: "Multiple agents simultaneously attempt on the same input, but adopting different personas, or perspectives, yielding diverse outputs that can be aggregated. Example: Comprehensive content reviews.", 'icon': ParallelIcon},
    // "Voting": VotingIcon,
    "Supervision": {description: "A hierarchical structure where a central agent dynamically decide which worker agents to act based on the current generated output. Example: Content refinement.", 'icon':SupervisionIcon},
    // any other icons ...
  };

  export const iconMap1 = {
    "Sequential": {description: "subtasks operate in a fixed order, passing results from one to the next.", 'icon':SequentialTaskIcon},
    "Parallel": {description: "Multiple subtasks run simultaneously.", 'icon':ParallelTaskIcon}
  };

  export const iconMap3 = {
    "Tool Use": {description: 'An agent invokes external tools', 'icon':WebsearchIcon},
    "Prompting": {description: '', 'icon':PromptIcon },
    "Data Retrieval": {description: 'An agent retrieves relevant information from a data store or knowledge base', 'icon': RagIcon},
  };

