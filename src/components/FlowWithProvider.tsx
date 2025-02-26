import { ReactFlowProvider } from '@xyflow/react'
import { FlowPanelComponent } from "./FlowComponent";
import { RflowComponent } from "./FlowComponentPattern";
import { FlowComponentTask } from "./FlowComponentTask";

export function FlowWithProvider(props) {
    return (
        <div className="reactflow-provider">
            <ReactFlowProvider>
                <FlowPanelComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}

export function RfWithProvider(props) {
    return (
        <div className="reactflow-provider-wrapper">
            <ReactFlowProvider>
                <RflowComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}

export function TaskFlowWithProvider(props) {
    return (
        <div className="reactflow-provider-wrapper">
            <ReactFlowProvider>
                <FlowComponentTask {...props} />
            </ReactFlowProvider>
        </div>
    );
}