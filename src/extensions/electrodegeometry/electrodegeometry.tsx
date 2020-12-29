// LABBOX-EXTENSION: electrodegeometry
// LABBOX-EXTENSION-TAGS: jupyter

import { faThLarge } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FunctionComponent } from 'react';
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../extensionInterface";
import ElectrodeGeometryWidget from './ElectrodeGeometryWidget/ElectrodeGeometryWidget';

const zipElectrodes = (locations: number[][], ids: number[]) => {
    if (locations && ids && ids.length !== locations.length) throw Error('Electrode ID count does not match location count.')
    return ids.map((x, index) => {
        const loc = locations[index]
        return { label: x + '', x: loc[0], y: loc[1] }
    })
}

const ElectrodeGeometryRecordingView: FunctionComponent<RecordingViewProps> = ({recording, width, height, recordingSelection, recordingSelectionDispatch}) => {
    const ri = recording.recordingInfo
    const electrodes = ri ? zipElectrodes(ri.geom, ri.channel_ids) : []
    // const [selectedElectrodeIds, setSelectedElectrodeIds] = useState<number[]>([]);
    if (!ri) {
        return (
            <div>No recording info found for recording.</div>
        )
    }
    return (
        <ElectrodeGeometryWidget
            electrodes={electrodes}
            selectedElectrodeIds={recordingSelection.selectedElectrodeIds || []}
            onSelectedElectrodeIdsChanged={(x: number[]) => {recordingSelectionDispatch({type: 'SetSelectedElectrodeIds', selectedElectrodeIds: x})}}
            width={width || 350}
            height={height || 150}
        />
    );
}

const ElectrodeGeometrySortingView: FunctionComponent<SortingViewProps> = ({recording, plugins, hither, calculationPool, width, height, recordingSelection, recordingSelectionDispatch}) => {
    return (
        <ElectrodeGeometryRecordingView
            {...{recording, plugins, hither, calculationPool, width, height, recordingSelection, recordingSelectionDispatch}}
        />
    )
}

export function activate(context: ExtensionContext) {
    context.registerRecordingView({
        name: 'ElectrodeGeometryRecordingView',
        label: 'Electrode geometry',
        priority: 50,
        defaultExpanded: false,
        component: ElectrodeGeometryRecordingView,
        singleton: true,
        icon: <FontAwesomeIcon icon={faThLarge} />
    })
    context.registerSortingView({
        name: 'ElectrodeGeometrySortingView',
        label: 'Electrode geometry',
        priority: 50,
        component: ElectrodeGeometrySortingView,
        singleton: true,
        icon: <FontAwesomeIcon icon={faThLarge} />
    })
}