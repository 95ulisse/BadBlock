// Some parameters to configure the animation
const ANIMATION_DURATION = 800;
const LOOP_DELAY = 3000;
const LINE_WIDTH = 5;

/**
 * Simple particle for coin effect.
 */
export default class CircleParticle {

    constructor(timeline, center, color, radius = 50, inwards = false) {
        this._timeline = timeline;
        this._center = center;
        this._color = color;
        this._radius = radius;
        this._currentRadius = inwards ? radius : 0;

        // Create the animation and store the tween
        timeline.animateTo(this, '_currentRadius', inwards ? 0 : radius, ANIMATION_DURATION, {
            loop: 'loop',
            loopDelay: LOOP_DELAY
        });
        this._tween = timeline.tweens[timeline.tweens.length - 1];
    }

    render(context) {
        const {
            _currentRadius: currentRadius,
            _radius: radius,
            _center: center,
            _color: color
        } = this;

        if (currentRadius === 0) {
            return;
        }

        // We compute the opacity based on the current radius
        context.globalAlpha = 1 - (currentRadius / radius);

        // Draw the circle
        context.beginPath();
        context.arc(center.x, center.y, currentRadius, 0, 2 * Math.PI);
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