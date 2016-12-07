import React, { PropTypes } from 'react';

import { connect } from '../util/state';
import Loading from './containers/Loading';
import Intro from './containers/Intro';
import Error from './containers/Error';
import LevelSelect from './containers/LevelSelect';
import Level from './containers/Level';

const App = props => {
    let Stage;
    
    switch (props.stage) {
        
        case 'loading':
            Stage = Loading;
            break;
        
        case 'intro':
            Stage = Intro;
            break;
        
        case 'error':
            Stage = Error;
            break;
        
        case 'levelselect':
            Stage = LevelSelect;
            break;
        
        case 'level':
            Stage = Level;
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