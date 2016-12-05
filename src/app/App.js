import React, { Component } from 'react';

import Loading from './components/Loading';
import Intro from './components/Intro';

export default class App extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            stage: Loading
        };
        this.navigator = {
            goToIntro: () => this.setState({ stage: Intro })
        };
    }

    render() {
        const navigator = this.navigator;
        const Stage = this.state.stage;
        return <Stage navigator={navigator} />;
    }

};