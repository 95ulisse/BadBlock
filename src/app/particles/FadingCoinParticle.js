import EventEmitter from 'eventemitter3';
import { interpolators } from '../../util/Tween';

const SPIN_SPEED = 200;
const UP = 30;
const UP_DURATION = 1000;
const UP_DELAY = 500;

export default class FadingCoinParticle extends EventEmitter {

    constructor(timeline, coin) {
        super();
        this._timeline = timeline;
        this._coin = coin;
        this._sx = 0;
        this._up = 0;

        // Create the animation and store the tween
        timeline
            .animateTo(this, '_sx', 32 * 8, SPIN_SPEED, {
                loop: 'loop',
                interpolator: interpolators.steps(32)
            })
            .delay(UP_DELAY)
            .animateTo(this, '_up', UP, UP_DURATION);

        // Fire the `end` event when the last tween ends
        const t1 = timeline.tweens[timeline.tweens.length - 1];
        const t2 = timeline.tweens[timeline.tweens.length - 2];
        t1.on('end', () => {
            timeline.tweens.splice(timeline.tweens.indexOf(t1), 1);
            timeline.tweens.splice(timeline.tweens.indexOf(t2), 1);
            this.emit('end');
        });
    }

    render(context) {
        const { _coin: coin, _sx: sx, _up: up } = this;

        // Draw the coin
        const { image, sy, width, height, dx, dy } = coin.render;
        const pos = coin.position;
        context.globalAlpha = 1 - (up / UP);
        context.drawImage(image, sx, sy, width, height, dx + pos.x, dy + pos.y - up, width, height);

    }

}