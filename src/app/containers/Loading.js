import React, { Component, PropTypes } from 'react';

import { connect } from '../../util/state';
import { loadAssets, goToIntro, goToError } from '../actions/app';
import { updateLevels, generateThumbs } from '../actions/levels';

@connect(
    state => ({}),
    dispatch => ({
        loadAssets: () => dispatch(loadAssets()),
        updateLevels: () => dispatch(updateLevels()),
        generateThumbs: () => dispatch(generateThumbs()),
        goToIntro: () => dispatch(goToIntro()),
        goToError: (e) => dispatch(goToError(e))
    })
)
export default class Loading extends Component {

    static propTypes = {
        loadAssets: PropTypes.func.isRequired,
        updateLevels: PropTypes.func.isRequired,
        generateThumbs: PropTypes.func.isRequired,
        goToIntro: PropTypes.func.isRequired,
        goToError: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { loadAssets, updateLevels, generateThumbs, goToIntro, goToError } = this.props;
        loadAssets()
            .then(updateLevels)
            .then(generateThumbs)
            .then(goToIntro)
            .catch(goToError);
    }

    render() {
        return (
            <span>LOADING</span>
        );
    }

};