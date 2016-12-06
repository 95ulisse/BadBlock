import React, { Component, PropTypes } from 'react';

import styles from './LevelThumb.scss';

export default class LevelThumb extends Component {

    static propTypes = {
        entranceDelay: PropTypes.number,
        level: PropTypes.object.isRequired
    };

    static defaultProps = {
        entranceDelay: 0
    };

    constructor(props) {
        super(props);
        this.state = { isIn: false };
    }

    componentWillMount() {
        setTimeout(() => {
            this.setState({ isIn: true })
        }, this.props.entranceDelay);
    }

    render() {
        const { level } = this.props;
        const { isIn } = this.state;
        const inClass = isIn ? ' ' + styles['in'] : '';

        return (
            <div className={styles['level-thumb'] + inClass}>
                <span>{level.name}</span>
            </div>
        );
    }

};