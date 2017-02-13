import EventEmitter from 'eventemitter3';
import { Body, Vector } from 'phy6-js';
import { interpolators } from '../../util/Tween';

const SPIN_SPEED = 200;
const UP = 30;
const UP_DURATION = 1000;
const UP_DELAY = 500;
const PARTICLE_NUMBER = 30;
const PARTICLE_SIZE = 3;
const PARTICLE_TTL = 100;

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

    addParticlesToEngine(engine) {
        for (let i = 0; i < PARTICLE_NUMBER; i++) {
            const particle = new Body({
                position: this._coin.position,
                vertices: [
                    new Vector(-PARTICLE_SIZE, -PARTICLE_SIZE),
                    new Vector(PARTICLE_SIZE, -PARTICLE_SIZE),
                    new Vector(PARTICLE_SIZE, PARTICLE_SIZE),
                    new Vector(-PARTICLE_SIZE, PARTICLE_SIZE)
                ],
                previousPosition: new Vector(7 * Math.random() * (10 * Math.random() < 5 ? 1 : -1), 7 * Math.random()),
                isParticle: true,
                ttl: PARTICLE_TTL,
                render: {
                    draw: (context, p, _, helpers) => {
                        helpers.drawHull();
                        context.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.ttl / PARTICLE_TTL})`;
                        context.fill();
                    }
                }
            });
            particle.color = {
                r: Math.ceil(255 * Math.random()),
                g: Math.ceil(255 * Math.random()),
                b: Math.ceil(255 * Math.random())
            };
            engine.bodies.push(particle);
        }
    }

}