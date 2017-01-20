import React, { Component, PropTypes } from 'react';

import styles from './Stars.scss';

const Stars =  (props) => {
    const { stars, maxStars, size, ...otherProps } = props;
    return (
        <div {...otherProps} className={styles['stars-container']}>
            {[...Array(maxStars).keys()].map(i =>
                // Stars
                <span key={i} className={i < stars ? styles['active'] : null} style={{ fontSize: size + 'px' }}>
                    &#9733;
                </span>
            )}
        </div>
    );
};

Stars.propTypes = {
    stars: PropTypes.number,
    maxStars: PropTypes.number.isRequired,
    size: PropTypes.number
};

Stars.defaultProps = {
    stars: 0,
    size: 90
};

export default Stars;