import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { goToLevel } from '../actions/app';
import LevelThumb from '../components/LevelThumb';

@connect(
    state => ({
        levels: state.levels.allLevels
    }),
    dispatch => ({
        goToLevel: l => dispatch(goToLevel(l))
    })
)
export default class LevelSelect extends Component {

    static propTypes = {
        levels: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
        goToLevel: PropTypes.func.isRequired
    };

    render() {
        const { levels, goToLevel } = this.props;
        return (
            <div>
                {levels.map((l, i) =>
                    <LevelThumb key={i} level={l} entranceDelay={i * 100}
                        onClick={goToLevel.bind(null, i)} />
                )}
            </div>
        );
    }

};