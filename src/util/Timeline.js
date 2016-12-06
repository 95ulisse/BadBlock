import { Timer } from 'phy6-js';
import EventEmitter from 'eventemitter3';
import extend from 'extend';

import Tween from './Tween';

/**
 * Manager and runner for tweens.
 * Updates the tweens 60 times per second.
 */
export default class Timeline extends EventEmitter {

    /**
     * Constructs a new timeline with the given tweens.
     * 
     * @param {Tween[]} tweens - Initial tweens to add to the timeline.
     */
    constructor(tweens = []) {
        super();
        
        // Properties
        this.tweens = [];
        this.isRunning = false;
        this.time = 0;
        this.ended = false; 
        this._delay = 0;

        // Adds the starting tweens
        tweens.forEach(this.add.bind(this));

        // Create a new timer and advance all the tweens at every tick
        this._timer = new Timer({ fps: 60, isFixed: true });
        this._timer.on('tick', ({ delta }) => {
            this.time += delta;
            this.tweens.forEach(t => {
                if (!t.ended) {
                    this.ended = false;
                    t.update(delta);
                }
            });
        });

    }

    /**
     * Starts the timeline.
     * 
     * @returns Returns `this` for chaining.
     */
    start() {
        this._timer.start();
        this.isRunning = true;
        return this;
    }

    /**
     * Stops the timeline.
     * 
     * @returns Returns `this` for chaining.
     */
    stop() {
        this.isRunning = false;
        this._timer.stop();
        return this;
    }

    /**
     * Adds the given tween to the timeline.
     * 
     * @param {Tween} tween - Tween to add.
     * @returns Returns `this` for chaining.
     */
    add(tween) {
        this.tweens.push(tween);

        // Mark the timeline as ended (and fire the `end` event)
        // if all the tweens have ended
        tween.on('end', () => {
            if (this.tweens.every(t => t.ended)) {
                this.ended = true;
                this.stop();
                this.emit('end');
            }
        });

        return this;
    }

    /**
     * Shortcut to animate the property of an object to a given value.
     * 
     * @param {object} obj - Object whose property will be animated.
     * @param {string} prop - Name of the property to animate.
     * @param {any} endValue - Final value of the property.
     * @param {number} duration - Duration (in ms) of the animation.
     * @param {object} [options] - Other options for the tween.
     * @returns Returns `this` for chaining.
     */
    animateTo(obj, prop, endValue, duration, options) {
        
        const t = new Tween(extend({
            startValue: obj[prop],
            endValue,
            duration,
            startTime: this._delay
        }, options));

        t.on('change', newVal => {
            obj[prop] = newVal;
        });

        this.add(t);

        return this;
    }

    /**
     * Shortcut to animate the style of a DOM element to a given value.
     * 
     * @param {HTMLElement} el - Object whose style will be animated.
     * @param {string} prop - Name of the style to animate.
     * @param {any} endValue - Final value of the property.
     * @param {number} duration - Duration (in ms) of the animation.
     * @param {object} [options] - Other options for the tween.
     * @returns Returns `this` for chaining.
     */
    styleTo(el, prop, endValue, duration, options) {
        
        const t = new Tween(extend({
            startValue: parseFloat(window.getComputedStyle(el, null)[prop]),
            endValue,
            duration,
            startTime: this._delay
        }, options));

        t.on('change', newVal => {
            el.style[prop] = newVal;
        });

        this.add(t);

        return this;
    }

    /**
     * Delays the next animations by the given amount.
     * 
     * @param {number} amount - Amount of time to delay the following animations.
     * @returns Returns `this` for chaining.
     */
    delay(amount) {
        this._delay += amount;
        return this;
    }

};