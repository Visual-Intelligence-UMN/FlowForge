import { FlowComponent } from "./Flows";
import { ReactFlowProvider } from '@xyflow/react'

export function FlowWithProvider(props) {
    return (
        <ReactFlowProvider>
            <FlowComponent {...props} />
        </ReactFlowProvider>
    );
}