import React, { Component, PropTypes } from 'react';

import styles from './ChangeAnimation.scss';

/**
 * Component providing a simple sliding-like effect for children change.
 */
export default class ChangeAnimation extends Component {

    static propTypes = {
        children: PropTypes.node
    };

    constructor(props) {
        super(props);
        this.queue = [];
        this.timer = null;
        this.state = {
            current: props.children,
            next: null,
            flip: false
        };
    }

    _onTimerTick() {
        const q = this.queue;
        const flip = this.state.flip;
        this.setState({
            [flip ? 'current' : 'next']: q.shift(),
            flip: !flip
        });

        if (q.length) {
            this.timer = setTimeout(this._onTimerTick.bind(this), 200);
        } else {
            this.timer = null;
        }
    }

    _startTimer() {
        if (!this.timer) {
            this.timer = setTimeout(this._onTimerTick.bind(this), 200);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.children != nextProps.children) {

            // We push the new content to the queue and start the timer
            this.queue.push(nextProps.children);
            this._startTimer();

        }
    }

    componentWillUnmount() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    render() {
        // Note that the content is taken from the state
        const { current, next, flip } = this.state;
        const { className, ...otherProps } = this.props;

        // Swaps in and out classes
        const cssIn = flip ? styles['out'] : styles['in'];
        const cssOut = flip ? styles['in'] : styles['out'];

        return (
            <div {...otherProps} className={styles['container'] + (className ? ' ' + className : '')}>
                <div className={styles['current'] + ' ' + cssIn}>{current}</div>
                <div className={styles['next'] + ' ' + cssOut}>{next}</div>
            </div>
        );
    }

}