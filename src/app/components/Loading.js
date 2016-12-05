import React, { Component, PropTypes } from 'react';

export default class Loading extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            percentage: 0
        };
    }

    componentWillMount() {
        this._interval = setInterval(() => {
            this.setState({ percentage: this.state.percentage + 1 });
        }, 10);
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.percentage > 100) {
            nextProps.navigator.goToIntro();
        }
    }

    componentWillUnmount() {
        clearTimeout(this._interval);
    }

    render() {
        const { percentage } = this.state;
        const { navigator } = this.props;

        return (
            <progress min="0" max="100" value={percentage} />
        );
    }

};