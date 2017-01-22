import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { goToLevelSelect, goToLevel } from '../actions/app';

import Stars from '../components/Stars';

import styles from './LevelModal.scss';

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
export default class LevelModal extends Component {

    static propTypes = {
        reason: PropTypes.oneOf([ 'paused', 'won' ]).isRequired,
        level: PropTypes.object.isRequired,
        shots: PropTypes.number,
        replayLevel: PropTypes.func.isRequired,
        resumeLevel: PropTypes.func,

        allLevels: PropTypes.array.isRequired,
        currentLevelIndex: PropTypes.number.isRequired,
        goToLevelSelect: PropTypes.func.isRequired,
        goToLevel: PropTypes.func.isRequired
    };

    render() {
        const {
            reason, level, shots, replayLevel, resumeLevel,
            allLevels, currentLevelIndex, goToLevel, goToLevelSelect
        } = this.props;

        // Checks that the required properties are present for the current reason
        let title;
        let showStars = false;
        let showNext = false;
        let showResume = false;
        switch (reason) {

            case 'paused':
                title = 'Paused';
                showResume = true;
                if (typeof resumeLevel !== 'function') {
                    throw new Error('Please, provide `resumeLevel` function.');
                }
                break;

            case 'won':
                title = 'Level completed';
                showStars = true;
                showNext = true;
                if (typeof shots !== 'number') {
                    throw new Error('Please, provide `shots` number.');
                }
                break;

        }

        return (
            <div className={styles['container']}>

                {/* Heading */}
                <h1>{title}</h1>

                {/* Stars */}
                {showStars &&
                    <Stars stars={level.computeStars(shots)} maxStars={3}
                        style={{ display: 'block', textAlign: 'center', margin: '10px 0' }} />
                }
                
                {/* Navigation buttons */}
                <button className="btn" onClick={replayLevel} style={{ float: 'left' }}>
                    <i className="fa fa-fw fa-refresh" /> Replay level
                </button>
                {showNext &&
                    <button className="btn" style={{ float: 'right' }}
                        disabled={currentLevelIndex + 1 >= allLevels.length}
                        onClick={goToLevel.bind(null, currentLevelIndex + 1)}>
                        <i className="fa fa-fw fa-play" /> Next level
                    </button>
                }
                {showResume &&
                    <button className="btn" style={{ float: 'right' }}
                        onClick={resumeLevel}>
                        <i className="fa fa-fw fa-play" /> Resume
                    </button>
                }
                <div style={{ clear: 'both' }} />
                <button className="btn" style={{ display: 'block', margin: '15px auto 0 auto' }} onClick={goToLevelSelect}>
                    <i className="fa fa-fw fa-list-ul" /> Level select
                </button>

            </div>
        );
    }

};