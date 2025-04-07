
export function computeParallelStepsForAll(stepMetadata) {
    const adjacencyList = {};
    const inDegree = {};
    for (const step of Object.keys(stepMetadata)) {
      adjacencyList[step] = stepMetadata[step].nextSteps || [];
      inDegree[step] = 0;
    }
    for (const step of Object.keys(stepMetadata)) {
      for (const child of adjacencyList[step]) {
        inDegree[child] = (inDegree[child] ?? 0) + 1;
      }
    }
  
    const levels = [];
    let currentQueue = Object.keys(inDegree).filter((s) => inDegree[s] === 0);
  
    while (currentQueue?.length > 0) {
      levels.push(currentQueue);
      const nextQueue = [];
      for (const s of currentQueue) {
        for (const child of adjacencyList[s]) {
          inDegree[child]--;
          if (inDegree[child] === 0) {
            nextQueue.push(child);
          }
        }
      }
      currentQueue = nextQueue;
    }
  
    const stepToLevel = {};
    levels.forEach((level, idx) => {
      for (const st of level) {
        stepToLevel[st] = idx;
      }
    });
  

    const parallelMap = {};
    levels.forEach((level) => {
      level.forEach((st) => {
        parallelMap[st] = level; 
      });
    });
  
    return parallelMap;
  }
  