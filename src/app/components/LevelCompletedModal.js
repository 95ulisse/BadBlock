import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { goToLevelSelect, goToLevel } from '../actions/app';

import Stars from '../components/Stars';

import styles from './LevelCompletedModal.scss';

@connect(
    state => ({
        allLevels: state.levels.allLevels,
        currentLevelIndex: state.app.currentLevel
    }),
    dispatch => ({
        goToLevelSelect: () => dispatch(goToLevelSelect()),
        goToLevel: l => dispatch(goToLevel(l))
    })
)
export default class LevelCompletedModal extends Component {

    static propTypes = {
        level: PropTypes.object.isRequired,
        shots: PropTypes.number.isRequired,
        replayLevel: PropTypes.func.isRequired,

        allLevels: PropTypes.array.isRequired,
        currentLevelIndex: PropTypes.number.isRequired,
        goToLevelSelect: PropTypes.func.isRequired,
        goToLevel: PropTypes.func.isRequired
    };

    render() {
        const {
            level, shots, replayLevel, 
            allLevels, currentLevelIndex, goToLevel, goToLevelSelect
        } = this.props;

        return (
            <div className={styles['container']}>

                {/* Heading */}
                <h1>Level completed</h1>

                {/* Stars */}
                <Stars stars={level.computeStars(shots)} maxStars={3}
                    style={{ display: 'block', textAlign: 'center', margin: '10px 0' }} />
                
                {/* Navigation buttons */}
                <button className="btn" onClick={replayLevel} style={{ float: 'left' }}>
                    <i className="fa fa-fw fa-refresh" /> Replay level
                </button>
                <button className="btn" style={{ float: 'right' }}
                    disabled={currentLevelIndex + 1 >= allLevels.length}
                    onClick={goToLevel.bind(null, currentLevelIndex + 1)}>
                    <i className="fa fa-fw fa-play" /> Next level
                </button>
                <div style={{ clear: 'both' }} />
                <button className="btn" style={{ display: 'block', margin: '15px auto 0 auto' }} onClick={goToLevelSelect}>
                    <i className="fa fa-fw fa-list-ul" /> Level select
                </button>

            </div>
        );
    }

};