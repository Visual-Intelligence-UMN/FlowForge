
export function calculateCost(pattern, template) {

    const {maxRound} = template;

    let runtime = maxRound;
    let calls = null;
    
    switch (pattern.name) {
      case "Reflection":
        calls = `${maxRound} * 2`;
        runtime = `${maxRound} * 2`;
        break;
      case "Discussion":
        const {withSummary, agents} = template;
        calls = `${maxRound} * ${agents.length}` + (withSummary ? ` + 1` : ``);
        runtime = `${maxRound} * ${agents.length}` + (withSummary ? ` + 1` : ``);
        break;
      case "Redundant":
        const {agents: agentsRedundant} = template;
        calls = `${agentsRedundant.length} * 1 + 1`;
        runtime = `1 + 1`;
        break;
      // case "Voting":
      //   const {agents: agentsVoting} = template;
      //   calls = `${maxRound} * ${agentsVoting.length} + 1`;
      //   runtime = `${maxRound} * ${agentsVoting.length} + 1`;
      //   break;
      case "Supervision":
        calls = `${maxRound} * 2`;
        runtime = `${maxRound} * 2`;
        break;
      default:
        runtime = `1`;
        calls = `1`;
    }
    return {calls, runtime};
  }
