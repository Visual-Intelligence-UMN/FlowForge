import { Annotation } from "@langchain/langgraph/web";
import { BaseMessage } from "@langchain/core/messages";

const AgentsState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x,y) => x.concat(y),
    }), 
    sender: Annotation<string>({
        reducer: (x,y) => y ?? x ?? "user",
        default: () => "user",
    }), 
    step100: Annotation<BaseMessage[]>({
        default: () => [],
        reducer: (x,y) => x.concat(y),
    })

});

export {AgentsState};

// if no reducer specified, the value is overwritten
// const PDFState = Annotation.Root({
//     pdf: Annotation<string>({
//         reducer: (x,y) => x.concat(y),
//     })
// });

// use spec to merge the states

// const AgentState = Annotation.Root({
//     ...AgentsState.spec,
//     ...PDFState.spec,
// });


// const AgentState = Annotation.Root({
//   messages: Annotation<BaseMessage[]>({
//     reducer: (x, y) => x.concat(y),
//   }),
//   sender: Annotation<string>({
//     reducer: (x, y) => y ?? x ?? "user",
//     default: () => "user",
//   }),
//   pdf: Annotation<string>({
//     default: () => "",
//     reducer: (x,y) => x.concat(y),
//   })
// })

export { AgentState };