// Some parameters to configure the animation
const MAX_RADIUS = 50;
const ANIMATION_DURATION = 800;
const LOOP_DELAY = 3000;
const LINE_WIDTH = 5;

/**
 * Simple particle for coin effect.
 */
export default class CircleParticle {

    constructor(timeline, center, color) {
        this._timeline = timeline;
        this._center = center;
        this._color = color;
        this._radius = 0;

        // Create the animation and store the tween
        timeline.animateTo(this, '_radius', MAX_RADIUS, ANIMATION_DURATION, {
            loop: 'loop',
            loopDelay: LOOP_DELAY
        });
        this._tween = timeline.tweens[timeline.tweens.length - 1];
    }

    render(context) {
        const { _radius: radius, _center: center, _color: color } = this;

        // We compute the opacity based on the current radius
        context.globalAlpha = 1 - (radius / MAX_RADIUS);

        // Draw the circle
        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.lineWidth = LINE_WIDTH;
        context.strokeStyle = color;
        context.stroke();

    }

    stop() {

        // Removes the tween from the timeline
        const tweens = this._timeline.tweens;
        tweens.splice(tweens.indexOf(this._tween), 1);

    }

};