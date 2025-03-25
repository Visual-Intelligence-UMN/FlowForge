export function calculateCost(pattern, template) {
  const { maxRound } = template;

  let runtime = maxRound;
  let calls = null;
  let runtime_number = 1;
  let calls_number = 1;

  switch (pattern.name) {
    case "Reflection":
      calls = `${maxRound} * 2`;
      calls_number = maxRound * 2;
      runtime = `${maxRound} * 2`;
      runtime_number = maxRound * 2;
      break;
    case "Discussion":
      const { withSummary, agents } = template;
      calls = `${maxRound} * ${agents.length}` + (withSummary ? ` + 1` : ``);
      runtime = `${maxRound} * ${agents.length}` + (withSummary ? ` + 1` : ``);
      calls_number = maxRound * agents.length + (withSummary ? 1 : 0);
      runtime_number = maxRound * agents.length + (withSummary ? 1 : 0);
      break;
    case "Redundant":
      const { agents: agentsRedundant } = template;
      calls = `${agentsRedundant.length} * 1 + 1`;
      runtime = `1 + 1`;
      calls_number = agentsRedundant.length + 1;
      runtime_number = 1 + 1;
      break;
    // case "Voting":
    //   const {agents: agentsVoting} = template;
    //   calls = `${maxRound} * ${agentsVoting.length} + 1`;
    //   runtime = `${maxRound} * ${agentsVoting.length} + 1`;
    //   break;
    case "Supervision":
      calls = `${maxRound} * 2`;
      runtime = `${maxRound} * 2`;
      calls_number = maxRound * 2;
      runtime_number = maxRound * 2;
      break;
    default:
      runtime = `1`;
      calls = `1`;
  }
  return { calls, runtime, calls_number, runtime_number };
}
