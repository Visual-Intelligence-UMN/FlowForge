import { FlowComponent } from "./Flows";
import { ReactFlowProvider } from '@xyflow/react'

export function FlowWithProvider(props) {
    return (
        <div className="reactflow-provider">
            <ReactFlowProvider>
                <FlowComponent {...props} />
            </ReactFlowProvider>
        </div>
    );
}
