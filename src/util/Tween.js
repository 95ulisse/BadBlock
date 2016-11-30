/**
 * Generic mini tweening library.
 * Create a `Tween` object and call the `update` to compute the new values.
 */

import extend from 'extend';
import eases from 'eases';
import EventEmitter from 'eventemitter3';

const noop = () => {};

/**
 * Common interpolator functions.
 * An interpolator function is a special type of function used by the `Tween` class
 * that is able to transform a normalized time (between 0 and 1) to actual interpolated values.
 * 
 * This can be useful to implement, for example, color interpolation:
 * start and end values can be both colors in the RGB space and the interpolator
 * returns another color proportional to the normal time between the start and end one.
 * 
 * An interpolator function has 3 args: startValue, endValue and normalized time.
 */
export const interpolators = {
    number: (s, e, t) => s + t * (e - s) 
};

/**
 * A `Tween` represents the evolution of a value over time.
 * It starts at a given time, has a duration, and can loop.
 * The easing between the start value and the end value
 * is linear by default, but can be changed by using a custom function.
 * 
 * Note that the values to interpolate are not constrained to be numbers,
 * a `Tween` can animate all types of values if provided with the
 * right interpolator function. For the common interpolators see the exported
 * object `interpolators`.
 * 
 * @class
 */
export default class Tween extends EventEmitter {

    /**
     * Creates a new instance of the `Tween` class.
     * 
     * @param {object} options - Options to set immediately on the tween.
     */
    constructor(options) {
        super();
        
        extend(this, {
            startValue: 0,
            endValue: 1,
            duration: 1000,
            startTime: 0,
            loop: 'single',
            loopTimes: Infinity,
            easing: eases.linear,
            interpolator: interpolators.number
        }, options);

        this._absoluteTime = 0;
        this._lastValue = null;
    }

    startValue(v) {
        this.startValue = v;
        return this;
    }

    endValue(v) {
        this.endValue = v;
        return this;
    }

    duration(v) {
        this.duration = v;
        return this;
    }

    startTime(v) {
        this.startTime = v;
        return this;
    }

    loop(v) {
        this.loop = v;
        return this;
    }

    loopTimes(v) {
        this.loopTimes = v;
        return this;
    }

    easing(v) {
        this.easing = v;
        return this;
    }

    interpolator(v) {
        this.interpolator = v;
        return this;
    }

    onChange(cb) {
        this.on('change', cb);
        return this;
    }
    
    /**
     * Notifies the tween that time has passed.
     * Automatically computes the new value and raises the needed events.
     * 
     * @param {number} delta - Time difference from the last call.
     */
    update(delta) {

        let {
            startValue,
            endValue,
            duration,
            startTime,
            loop,
            loopTimes,
            easing,
            interpolator
        } = this;

        // Easing function can be expressed as a string
        easing = typeof easing === 'string' ? eases[easing] : easing;

        // Update the absolute time
        this._absoluteTime += delta;

        // First of all, subtract the start time, to have have the times aligned
        let t = this._absoluteTime - startTime;

        let newValue;
        let emitEnd = false;

        // Instants of time before the beginning of the animation
        // are coerced to use the start value
        if (t < 0) {
            newValue = startValue;
        } else {

            /*
             * What are those segments?
             * 
             * t=0
             * |
             * |   0              1              0              1              0
             * |   |--------------|--------------|--------------|--------------|---
             * |---|  Segment 0   |  RSegment 1  |  Segment 2   |  RSegment 3  |
             * |   |--------------|--------------|--------------|--------------|---
             * |
             *
             * If we think of an animation as the evolution of a value with respect
             * to time, a segment is a time span in which the value goes from 0 to 1
             * (or 1 to 0, if the animation is reversed).
             * 
             * An animation that repeats only once has just one segment,
             * while one that gets reverted has two segments (one from 0 to 1,
             * and one from 1 to 0). Loops are implemented by the means of an
             * infinite sequence of segments, and loops repeated a finite number
             * times are just a sequence of segments.
             */
            const segmentIndex = Math.floor(t / duration);
            const valueInSegment = (t % duration) / duration;

            switch (loop) {
                
                case 'single':
                    if (segmentIndex > 0) {
                        newValue = endValue;
                        emitEnd = true;
                    } else {
                        newValue = interpolator(startValue, endValue, easing(valueInSegment));
                    }
                    break;
                
                case 'reverse':
                    if (segmentIndex > 1) {
                        newValue = startValue;
                        emitEnd = true;
                    } else if (segmentIndex === 0) {
                        newValue = interpolator(startValue, endValue, easing(valueInSegment));
                    } else {
                        newValue = interpolator(startValue, endValue, easing(1 - valueInSegment));
                    }
                    break;
                
                case 'loop':
                    if (segmentIndex + 1 > loopTimes) {
                        newValue = endValue;
                        emitEnd = true;
                    } else {
                        newValue = interpolator(startValue, endValue, easing(valueInSegment));
                    }
                    break;
                
                case 'loopReverse':
                    if (segmentIndex > loopTimes * 2 - 1) {
                        newValue = startValue;
                        emitEnd = true;
                    } else if (segmentIndex % 2 === 0) {
                        newValue = interpolator(startValue, endValue, easing(valueInSegment));
                    } else {
                        newValue = interpolator(startValue, endValue, easing(1 - valueInSegment));
                    }
                    break;
                    
                default:
                    throw new Error(`Invalid loop type: ${loop}.`);

            }

        }

        // Emit `change` event if the value changed
        if (this._lastValue !== newValue) {
            this._lastValue = newValue;
            this.emit('change', newValue);
        }

        // Emit `end` if the value will never change again
        if (emitEnd) {
            this.emit('end');
        }

    }

};