import { Accordion, AccordionDetails, AccordionSummary, CircularProgress } from '@material-ui/core';
import React, { Dispatch, useCallback, useEffect, useState } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { addUnitLabel, removeUnitLabel, setExternalSortingUnitMetrics, setSortingInfo } from '../actions';
import SortingInfoView from '../components/SortingInfoView';
import { SortingUnitMetricPlugin, SortingUnitViewPlugin, SortingViewPlugin } from '../extension';
import { createHitherJob } from '../hither';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { sortByPriority } from '../reducers/extensionContext';
import { Recording } from '../reducers/recordings';
import { ExternalSortingUnitMetric, Sorting, SortingInfo } from '../reducers/sortings';

const intrange = (a: number, b: number) => {
  const lower = a < b ? a : b;
  const upper = a < b ? b : a;
  let arr = [];
  for (let n = lower; n <= upper; n++) {
      arr.push(n);
  }
  return arr;
}

interface StateProps {
  sortingViews: {[key: string]: SortingViewPlugin}
  sortingUnitViews: {[key: string]: SortingUnitViewPlugin}
  sortingUnitMetrics: {[key: string]: SortingUnitMetricPlugin}
  sorting: Sorting | undefined
  recording: Recording | undefined
  extensionsConfig: any
  documentInfo: DocumentInfo
}

interface DispatchProps {
  onSetSortingInfo: (a: {sortingId: string, sortingInfo: SortingInfo}) => void
  onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => void
  onAddUnitLabel: (a: { sortingId: string, unitId: number, label: string }) => void
  onRemoveUnitLabel: (a: { sortingId: string, unitId: number, label: string }) => void
}

interface OwnProps {
  sortingId: string
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps

type CalcStatus = 'waiting' | 'computing' | 'finished'

type SelectedUnitIds = {[key: string]: boolean}

const SortingView: React.FunctionComponent<Props> = (props) => {
  const { sortingViews, sortingUnitViews, documentInfo, sorting, sortingId, recording, onSetSortingInfo, onSetExternalUnitMetrics, onAddUnitLabel, onRemoveUnitLabel, extensionsConfig, sortingUnitMetrics } = props
  const { documentId, feedUri, readOnly } = documentInfo;
  const [sortingInfoStatus, setSortingInfoStatus] = useState<CalcStatus>('waiting');
  const [externalUnitMetricsStatus, setExternalUnitMetricsStatus] = useState<CalcStatus>('waiting');
  // const [selection, dispatchSelection] = useReducer(updateSelections, {focusedUnitId: null, selectedUnitIds: {}});
  const [selectedUnitIds, setSelectedUnitIds] = useState<SelectedUnitIds>({})
  const [focusedUnitId, setFocusedUnitId] = useState<number | null>(null)

  // const effect = async () => {
  //   if ((sorting) && (recording) && (!sorting.sortingInfo) && (sortingInfoStatus === 'waiting')) {
  //     setSortingInfoStatus('computing');
  //     const sortingInfo = await createHitherJob(
  //       'createjob_get_sorting_info',
  //       { sorting_object: sorting.sortingObject, recording_object: recording.recordingObject },
  //       { kachery_config: {}, useClientCache: true, wait: true, newHitherJobMethod: true}
  //     );
  //     onSetSortingInfo({ sortingId, sortingInfo });
  //     setSortingInfoStatus('finished');
  //   }
  // }
  // useEffect(() => {effect()});

  useEffect(() => {
    if ((sorting) && (recording) && (!sorting.sortingInfo) && (sortingInfoStatus === 'waiting')) {
      setSortingInfoStatus('computing');
      createHitherJob(
        'createjob_get_sorting_info',
        { sorting_object: sorting.sortingObject, recording_object: recording.recordingObject },
        { kachery_config: {}, useClientCache: true, wait: true, newHitherJobMethod: true}
      ).then((sortingInfo: SortingInfo) => {
        onSetSortingInfo({ sortingId, sortingInfo });
        setSortingInfoStatus('finished');
      })
    }
  }, [onSetSortingInfo, setSortingInfoStatus, sortingInfoStatus, recording, sorting, sortingId])

  useEffect(() => {
    if ((sorting) && (sorting.externalUnitMetricsUri) && (!sorting.externalUnitMetrics) && (externalUnitMetricsStatus === 'waiting')) {
      setExternalUnitMetricsStatus('computing');
      createHitherJob(
        'fetch_external_sorting_unit_metrics',
        { uri: sorting.externalUnitMetricsUri },
        { kachery_config: {}, useClientCache: true, wait: true, newHitherJobMethod: true}
      ).then((externalUnitMetrics: ExternalSortingUnitMetric[]) => {
        onSetExternalUnitMetrics({ sortingId, externalUnitMetrics });
        setExternalUnitMetricsStatus('finished');
      })
    }
  }, [onSetExternalUnitMetrics, setExternalUnitMetricsStatus, externalUnitMetricsStatus, sorting, sortingId])

  const handleUnitClicked = useCallback((unitId, event) => {
    if (event.ctrlKey) {
      if (selectedUnitIds[unitId + '']) {
        setSelectedUnitIds({
          ...selectedUnitIds,
          [unitId + '']: false
        })
      }
      else {
        setSelectedUnitIds({
          ...selectedUnitIds,
          [unitId + '']: true
        })
        setFocusedUnitId(unitId)
      }
    }
    else if (event.shiftKey) {
      if (focusedUnitId !== null) {
        const unitIds = intrange(focusedUnitId, unitId)
        const newSelectedUnitIds = {...selectedUnitIds}
        const sortingInfo = sorting?.sortingInfo
        if (sortingInfo) {
          for (let uid of unitIds) {
            if (sortingInfo.unit_ids.includes(uid)) {
              newSelectedUnitIds[uid] = true
            }
          }
        }
        setSelectedUnitIds(newSelectedUnitIds)
      }
    }
    else {
      setSelectedUnitIds({[unitId + '']: true})
      setFocusedUnitId(unitId)
    }
  }, [selectedUnitIds, setSelectedUnitIds, focusedUnitId, sorting]);

  const sidebarWidth = '200px'

  const sidebarStyle = {
    'width': sidebarWidth,
    'height': '100%',
    'position': 'absolute',
    'zIndex': 1,
    'top': 165,
    'left': 0,
    'overflowX': 'hidden',
    'paddingTop': '20px',
    'paddingLeft': '20px'
  }

  const contentWrapperStyle = {
    'marginLeft': sidebarWidth
  }

  if (!sorting) {
    return <h3>{`Sorting not found: ${sortingId}`}</h3>
  }
  if (!recording) {
    return <h3>{`Recording not found: ${sorting.recordingId}`}</h3>
  }

  return (
    <div>
      <h3>
        {`Sorting: ${sorting.sortingLabel} for `}
          <Link to={`/${documentId}/recording/${recording.recordingId}/${getPathQuery({feedUri})}`}>
            {recording.recordingLabel}
          </Link>
      </h3>
      {
        (sortingInfoStatus === 'computing') ? (
          <div><CircularProgress /></div>
        ) : (
          <SortingInfoView
            sortingInfo={sorting.sortingInfo}
            selections={selectedUnitIds}
            focus={focusedUnitId !== null ? focusedUnitId : undefined}
            onUnitClicked={handleUnitClicked}
            curation={sorting.unitCuration || {}}
            styling={sidebarStyle}
          />
        )
      }
      <div style={contentWrapperStyle}>
        {
          sortByPriority(sortingViews).filter(v => (!v.disabled)).map(sv => {
            return (
              <Expandable
                key={sv.name}
                label={sv.label}
              >
                <sv.component
                  {...sv.props || {}}
                  sorting={sorting}
                  recording={recording}
                  selectedUnitIds={selectedUnitIds}
                  extensionsConfig={extensionsConfig}
                  focusedUnitId={focusedUnitId}
                  documentInfo={documentInfo}
                  onUnitClicked={handleUnitClicked}
                  onAddUnitLabel={onAddUnitLabel}
                  onRemoveUnitLabel={onRemoveUnitLabel}
                  onSelectedUnitIdsChanged={(s: {[key: string]: boolean}) => {
                    return setSelectedUnitIds(s)
                  }}
                  readOnly={readOnly}
                  sortingUnitViews={sortingUnitViews}
                  sortingUnitMetrics={sortingUnitMetrics}
                />
              </Expandable>
            )
          })
        }
      </div>
    </div>
  );
}

export const Expandable = (props: { label: string, children: React.ReactNode[] | React.ReactNode, defaultExpanded?: boolean }) => {
  return (
    <Accordion TransitionProps={{ unmountOnExit: true }} defaultExpanded={props.defaultExpanded}>
      <AccordionSummary>
        {props.label}
      </AccordionSummary>
      <AccordionDetails>
        <div style={{width: "100%"}}>
          {props.children}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

function findSortingForId(state: any, id: string): Sorting | undefined {
  return state.sortings.filter((s: any) => (s.sortingId === id)).map((s: any) => (s as any as Sorting))[0]
}

function findRecordingForId(state: any, id: string): Recording | undefined {
  return state.recordings.filter((s: any) => (s.recordingId === id)).map((s: any) => (s as any as Recording))[0]
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({ // todo
  sortingViews: state.extensionContext.sortingViews,
  sortingUnitViews: state.extensionContext.sortingUnitViews,
  sortingUnitMetrics: state.extensionContext.sortingUnitMetrics,
  // todo: use selector
  sorting: findSortingForId(state, ownProps.sortingId),
  recording: findRecordingForId(state, (findSortingForId(state, ownProps.sortingId) || {recordingId: ''}).recordingId),
  extensionsConfig: state.extensionsConfig,
  documentInfo: state.documentInfo
})

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
  onSetSortingInfo: (a: { sortingId: string, sortingInfo: SortingInfo }) => dispatch(setSortingInfo(a)),
  onSetExternalUnitMetrics: (a: { sortingId: string, externalUnitMetrics: ExternalSortingUnitMetric[] }) => dispatch(setExternalSortingUnitMetrics(a)),
  onAddUnitLabel: (a: { sortingId: string, unitId: number, label: string }) => dispatch(addUnitLabel(a)),
  onRemoveUnitLabel: (a: { sortingId: string, unitId: number, label: string }) => dispatch(removeUnitLabel(a)),
})

export default withRouter(connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(SortingView))