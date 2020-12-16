// LABBOX-EXTENSION: timeseries
// LABBOX-EXTENSION-TAGS: jupyter

import React, { FunctionComponent } from 'react';
import { ExtensionContext, RecordingViewProps, SortingViewProps } from "../extensionInterface";
import TimeseriesViewNew from './TimeseriesViewNew/TimeseriesViewNew';

const TimeseriesSortingView: FunctionComponent<SortingViewProps> = ({recording, hither, width, height}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recording.recordingInfo}
            width={width || 600}
            height={height || 600}
            hither={hither}
            opts={{channelSelectPanel: true}}
        />
    )
}

const TimeseriesRecordingView: FunctionComponent<RecordingViewProps> = ({recording, hither, width, height}) => {
    return (
        <TimeseriesViewNew
            recordingObject={recording.recordingObject}
            recordingInfo={recording.recordingInfo}
            width={width || 600}
            height={height || 600}
            hither={hither}
            opts={{channelSelectPanel: true}}
        />
    )
}

export function activate(context: ExtensionContext) {
    context.registerRecordingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        fullWidth: true,
        component: TimeseriesRecordingView,
    })
    context.registerSortingView({
        name: 'TimeseriesView',
        label: 'Timeseries',
        priority: 50,
        component: TimeseriesSortingView
    })
}