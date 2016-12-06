import React, { PropTypes } from 'react';

import { connect } from '../../util/state';
import { goToLevelSelect } from '../actions/app';
import IntroAnimation from '../components/IntroAnimation';

const Intro = ({ goToLevelSelect }) => {
    return <IntroAnimation onPlayClick={goToLevelSelect} />;
};

Intro.propTypes = {
    goToLevelSelect: PropTypes.func.isRequired
};

export default connect(
    state => ({}),
    dispatch => ({
        goToLevelSelect: () => dispatch(goToLevelSelect())
    })
)(Intro);