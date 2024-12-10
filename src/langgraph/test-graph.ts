export const graphVizGraph = {
    nodes: {
      __start__: {
        id: '__start__',
        data: [Object],
        name: '__start__',
        metadata: undefined
      },
      loader_tool: {
        id: 'loader_tool',
        data: [Object],
        name: 'loader_tool',
        metadata: {}
      },
      search_tool: {
        id: 'search_tool',
        data: [Object],
        name: 'search_tool',
        metadata: {}
      },
      agent_test: {
        id: 'agent_test',
        data: [Object],
        name: 'agent_test',
        metadata: {}
      },
      __end__: {
        id: '__end__',
        data: [Object],
        name: '__end__',
        metadata: undefined
      }
    },
    edges: [
      {
        source: '__start__',
        target: 'agent_test',
        data: undefined,
        conditional: false
      },
      {
        source: 'loader_tool',
        target: 'agent_test',
        data: undefined,
        conditional: false
      },
      {
        source: 'search_tool',
        target: 'agent_test',
        data: undefined,
        conditional: false
      },
      {
        source: 'agent_test',
        target: 'loader_tool',
        data: 'LoadPDF',
        conditional: true
      },
      {
        source: 'agent_test',
        target: 'search_tool',
        data: 'Search',
        conditional: true
      },
      {
        source: 'agent_test',
        target: '__end__',
        data: 'DoneWriting',
        conditional: true
      }
    ]
  }