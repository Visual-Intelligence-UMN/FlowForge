import { FlowComponent } from "./Flows";
import { ReactFlowProvider } from '@xyflow/react'
import { FlowPanelComponent } from "./FlowComponent";

export function FlowWithProvider(props) {
    return (
        <div className="reactflow-provider">
            <ReactFlowProvider>
                <FlowPanelComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}
