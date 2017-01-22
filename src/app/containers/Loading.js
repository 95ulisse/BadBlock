import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { loadAssets, goToIntro, goToError } from '../actions/app';
import { updateLevels } from '../actions/levels';

@connect(
    state => ({}),
    dispatch => ({
        loadAssets: () => dispatch(loadAssets()),
        updateLevels: () => dispatch(updateLevels()),
        goToIntro: () => dispatch(goToIntro()),
        goToError: (e) => dispatch(goToError(e))
    })
)
export default class Loading extends Component {

    static propTypes = {
        loadAssets: PropTypes.func.isRequired,
        updateLevels: PropTypes.func.isRequired,
        goToIntro: PropTypes.func.isRequired,
        goToError: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { loadAssets, updateLevels, goToIntro, goToError } = this.props;
        loadAssets()
            .then(updateLevels)
            .then(goToIntro)
            .catch(goToError);
    }

    render() {
        return (
            <span>LOADING</span>
        );
    }

};