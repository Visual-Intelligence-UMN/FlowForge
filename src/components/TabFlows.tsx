import {flowsAtom} from '../global/GlobalStates';
import {useAtom} from 'jotai';

const TabFlows = ({ selectedFlow, onSelectFlow }) => {
    const [flows] = useAtom(flowsAtom); // Access global flows

    return (
        <div className="tab-selection">
            <label>Select Flow:</label>
            <select
                value={selectedFlow || ''}
                onChange={(e) => onSelectFlow(e.target.value)}
            >
                <option value="" disabled>
                    Select a flow
                </option>
                {Object.keys(flows).map((id) => (
                    <option key={id} value={id}>
                        Flow {id}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TabFlows;