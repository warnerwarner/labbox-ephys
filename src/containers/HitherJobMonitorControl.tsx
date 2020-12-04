import React, { Dispatch, FunctionComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { setDispatch } from '../hither/createHitherJob';
import { getPathQuery } from '../kachery';
import { RootAction, RootState } from '../reducers';
import { DocumentInfo } from '../reducers/documentInfo';
import { HitherJob } from '../reducers/hitherJobs';

interface StateProps {
    allJobs: HitherJob[],
    pendingJobs: HitherJob[],
    runningJobs: HitherJob[],
    finishedJobs: HitherJob[],
    erroredJobs: HitherJob[],
    documentInfo: DocumentInfo,
    websocketStatus: string
}

interface DispatchProps {
    dispatch: Dispatch<RootAction>
}

interface OwnProps {
}

type Props = StateProps & DispatchProps & OwnProps

const HitherJobMonitorControl: FunctionComponent<Props> = ({ allJobs, pendingJobs, runningJobs, finishedJobs, erroredJobs, dispatch, documentInfo, websocketStatus }) => {
    const { documentId, feedUri, readOnly } = documentInfo;
    setDispatch(dispatch);
    const numRunning = runningJobs.length;
    const numFinished = finishedJobs.length;
    const numErrored = erroredJobs.length;
    const title = `Jobs: ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    return (
        <Link to={`/${documentId}/hitherJobMonitor${getPathQuery({feedUri})}`} style={{color: 'white'}} title={title}>
            <span style={{fontFamily: "courier", backgroundColor: (websocketStatus==='connected') ? '' :'red'}}>{numRunning}:{numFinished}:{numErrored}</span>
        </Link>
    );
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> = (state: RootState, ownProps: OwnProps): StateProps => ({
    allJobs: state.hitherJobs,
    pendingJobs: state.hitherJobs.filter(j => (j.status === 'pending')),
    runningJobs: state.hitherJobs.filter(j => (j.status === 'running')),
    finishedJobs: state.hitherJobs.filter(j => (j.status === 'finished')),
    erroredJobs: state.hitherJobs.filter(j => (j.status === 'error')),
    documentInfo: state.documentInfo,
    websocketStatus: state.serverConnection.websocketStatus
})
  
const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch: Dispatch<RootAction>, ownProps: OwnProps) => ({
    dispatch
})

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
    mapStateToProps,
    mapDispatchToProps
)(HitherJobMonitorControl)