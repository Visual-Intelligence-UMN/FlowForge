import { ReactFlowProvider } from '@xyflow/react'
import { FlowPanelComponent } from "../canvas-agents/FlowComponent";
import { RflowComponent } from "../canvas-patterns/FlowComponentPattern";
import { FlowComponentTask } from "../canvas-steps/FlowComponentTask";

// canvas-agents stage 3
export function FlowWithProvider(props) {
    return (
        <div className="reactflow-provider">
            <ReactFlowProvider>
                <FlowPanelComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}

// canvas-patterns stage 2
export function RfWithProvider(props) {
    return (
        <div className="reactflow-provider-wrapper">
            <ReactFlowProvider>
                <RflowComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}

// canvas-steps stage 1
export function TaskFlowWithProvider(props) {
    return (
        <div className="reactflow-provider-wrapper">
            <ReactFlowProvider>
                <FlowComponentTask {...props} />
            </ReactFlowProvider>
        </div>
    );
}