import React, { PropTypes } from 'react';

import { connect } from '../util/state';
import Loading from './containers/Loading';
import Intro from './containers/Intro';
import LevelSelect from './containers/LevelSelect';
import Error from './containers/Error';

const App = props => {
    let Stage;
    
    switch (props.stage) {
        
        case 'loading':
            Stage = Loading;
            break;
        
        case 'intro':
            Stage = Intro;
            break;
        
        case 'levelselect':
            Stage = LevelSelect;
            break;
        
        case 'error':
            Stage = Error;
            break;

    }

    return <Stage />;
};

App.propTypes = {
    stage: PropTypes.string.isRequired
};

export default connect(state => ({
    stage: state.app.stage
}))(App)