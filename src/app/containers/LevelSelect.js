import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import LevelThumb from '../components/LevelThumb';

@connect(state => ({ levels: state.levels.allLevels }))
export default class LevelSelect extends Component {

    render() {
        const { levels } = this.props;
        return (
            <div>
                {levels.map((l, i) =>
                    <LevelThumb key={i} level={l} entranceDelay={i * 100} />
                )}
            </div>
        );
    }

};