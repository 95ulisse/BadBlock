import React, { Component, PropTypes } from 'react';

import styles from './LevelThumb.scss';

export default class LevelThumb extends Component {

    static propTypes = {
        entranceDelay: PropTypes.number,
        level: PropTypes.object.isRequired,
        number: PropTypes.number,
        onClick: PropTypes.func
    };

    static defaultProps = {
        entranceDelay: 0,
        number: 1,
        onClick: () => {}
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
        const { level, number, onClick } = this.props;
        const { isIn } = this.state;
        const inClass = isIn ? ' ' + styles['in'] : '';

        return (
            <div className={styles['level-thumb'] + inClass} onClick={onClick}>
                <img src={level.thumb} />
                <div className={styles['name']}>
                    <span>{level.name}</span>
                </div>
                <span className={styles['number']}>{number}</span>
            </div>
        );
    }

};