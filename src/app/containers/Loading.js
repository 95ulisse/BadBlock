import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { goToIntro, goToError } from '../actions/app';
import { updateLevels } from '../actions/levels';

@connect(
    state => ({}),
    dispatch => ({
        updateLevels: () => dispatch(updateLevels()),
        goToIntro: () => dispatch(goToIntro()),
        goToError: () => dispatch(goToError())
    })
)
export default class Loading extends Component {

    static propTypes = {
        updateLevels: PropTypes.func.isRequired,
        goToIntro: PropTypes.func.isRequired,
        goToError: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { updateLevels, goToIntro, goToError } = this.props;
        updateLevels()
            .then(goToIntro)
            .catch(goToError);
    }

    render() {
        return (
            <span>LOADING</span>
        );
    }

};