/**
 * Set of helpers to manage levels.
 */

import { Body, BodyFactory, Vector } from 'phy6-js';
import EventEmitter from 'eventemitter3';
import extend from 'extend';

import Timeline from '../util/Timeline';
import { interpolators } from '../util/Tween';

import CircleParticle from '../app/particles/CircleParticle';

const WALLS_WIDTH = 20;
const HERO_SIZE = 20;
const COIN_RADIUS = 8;
const GOAL_RADIUS = 24;
const SPIKES_WIDTH = 12;

/**
 * Transforms the object description of a level in actual bodies for the physics.
 * Returns an object that fires important events for the game.
 * 
 * @param {object} desc - Description of the level to build.
 * @param {Engine} engine - Physics engine that runs the simulation.
 * @param {Timer} timer - Timer object that will be used for the animations.
 * @param {AssetManager} assets - AssetManager containing the sprites to use.
 * @param {Particle[]} particles - Array that will be populates with the particles needed for the level.
 * 
 * @returns {EventEmitter}
 * Returns an object that will fire the following events:
 * - `won`: The player won the game.
 * - `lost`: The player lost the game.
 * - `coinCollected`: The player collected a coin.
 * 
 * It also has the following references to bodies:
 * - `hero`
 * - `goal`
 * 
 * And the following properties representing the state of the level:
 * - `coinsCollected`
 * - `totalCoins`
 * 
 * Also, the following methods are available:
 * - `computeStars(shots)`
 */
export const buildLevel = (level, engine, timer, assets, particles) => {
    
    const bodies = engine.bodies;

    // Defaults
    level = extend({
        worldSize: {
            width: 600,
            height: 440
        },
        coins: [],
        walls: [],
        spikes: []
    }, level);

    // Creates the EventEmitter that we will return
    const ret = new EventEmitter();

    // Creates the Timeline object that will animate sprite frames
    ret.timeline = new Timeline([], timer);

    // First of all, create the cage that represents our world bounds
    bodies.push(...BodyFactory.cage(
        0,
        0,
        level.worldSize.width + 2 * WALLS_WIDTH,
        level.worldSize.height + 2 * WALLS_WIDTH,
        WALLS_WIDTH,
        {
            isStatic: true,
            render: {
                pattern: assets.getImage('wall')
            }
        }
    ));

    // The hero
    const hero = BodyFactory.rect(
        level.heroPosition.x - HERO_SIZE / 2,
        level.heroPosition.y - HERO_SIZE / 2,
        HERO_SIZE,
        HERO_SIZE,
        {
            render: {
                showAxes: true
            }
        }
    );
    ret.hero = hero;
    bodies.push(hero);

    // The goal
    const goal = BodyFactory.circle(
        level.goalPosition.x,
        level.goalPosition.y,
        GOAL_RADIUS,
        { isTrigger: true }
    );
    ret.goal = goal;
    const goalParticle = new CircleParticle(ret.timeline, goal.position, '#06c');
    goal.on('collision', collision => {
        if (collision.body1 === hero || collision.body2 === hero) {
            particles.splice(particles.indexOf(goalParticle), 1);
            goalParticle.stop();
            assets.playSound('win');
            ret.emit('won');
        }
    });
    goal.render = {
        showWireframe: false,
        image: assets.getImage('goal'),
        width: 48,
        height: 48,
        sx: 0,
        sy: 0,
        dx: -GOAL_RADIUS / 2 - 12,
        dy: -GOAL_RADIUS / 2 - 12
    };
    ret.timeline.animateTo(goal.render, 'sx', 48 * 5, 700, {
        loop: 'loop',
        interpolator: interpolators.steps(48)
    });

    // The coins
    ret.coinsCollected = 0;
    ret.totalCoins = level.coins.length;
    bodies.push(...level.coins.map(c => {
        const coin = BodyFactory.circle(c.x, c.y, COIN_RADIUS, { isTrigger: true });

        // Sprite animation
        coin.render = {
            showWireframe: false,
            image: assets.getImage('coin'),
            width: 32,
            height: 32,
            sx: 0,
            sy: 0,
            dx: -COIN_RADIUS / 2 - 12,
            dy: -COIN_RADIUS / 2 - 12
        };
        ret.timeline.animateTo(coin.render, 'sx', 32 * 8, 1000, {
            loop: 'loop',
            interpolator: interpolators.steps(32)
        });

        // Coin particle
        const particle = new CircleParticle(ret.timeline, coin.position, 'yellow');
        particles.push(particle);

        // Collision event
        coin.on('collision', collision => {
            if (collision.body1 === hero || collision.body2 === hero) {
                
                // Remove the coin and stop the particle
                bodies.splice(bodies.indexOf(coin), 1);
                particles.splice(particles.indexOf(particle), 1);
                particle.stop();
                
                // Play the sound fx
                assets.playSound('coin');

                // Rise the event
                ret.coinsCollected++;
                ret.emit('coinCollected', coin);

                // Add the goal to the world if all the coins have been collected
                if (ret.coinsCollected === level.coins.length) {
                    bodies.push(goal);
                    particles.push(goalParticle);
                    assets.playSound('goal');
                }

            }
        });

        return coin;
    }));

    // The spikes
    bodies.push(...level.spikes.map(s => {
        
        // Computes the angle of the spike line
        let angle = 0;
        if (s.x2 - s.x1 === 0) {
            angle = Math.PI / 2;
        } else {
            angle = Math.atan((s.y2 - s.y1) / (s.x2 - s.x1));
        }
        if (s.flip) {
             angle += Math.PI;
        }

        // Creates the spike body
        const spike = BodyFactory.line(s.x1, s.y1, s.x2, s.y2, SPIKES_WIDTH, !!s.flip, {
            isTrigger: true,
            render: {
                draw: (context, _, __, helpers) => {
                    helpers.drawHull();

                    // The spikes need to be rotated to match the orientation of the line
                    context.fillStyle = context.createPattern(assets.getImage('spikes'), 'repeat');
                    context.save();
                    context.translate(s.x1, s.y1);
                    context.rotate(angle);
                    context.fill();
                    context.restore();

                }
            }
        });
        spike.on('collision', (collision) => {
            if (collision.body1 === hero || collision.body2 === hero) {
                assets.playSound('spikes');
                ret.emit('lost');
            }
        });
        return spike;

    }));

    // The walls
    bodies.push(...level.walls.map(w => {
        const absoluteVertices = w.map(p => new Vector(p.x, p.y));
        let c = w.reduce((a, b) => [ a[0] + b.x, a[1] + b.y ], [ 0, 0 ]);
        c = new Vector(c[0] / w.length, c[1] / w.length);
        const relativeVertices = absoluteVertices.map(x => x.sub(c)); 
        return new Body({
            position: c,
            vertices: relativeVertices,
            isStatic: true,
            render: {
                pattern: assets.getImage('wall')
            }
        });
    }));

    // Starts the timeline
    ret.timeline.start();

    // Public methods

    // Hits the hero from the given point
    ret.shot = (point) => {

        // Computes the force to apply along the direction
        // connecting the point and the center of the body.
        const force =
            hero.position.sub(point)
            .normalize()
            .scalar(0.02);

        // Applies a force to the hero to make it move
        hero.applyForce(force, hero.position);

        // Plays the sound effect
        assets.playSound('hit' + Math.floor(1 + 5 * Math.random()));

    };

    // Returns the number of stars to assign if the user completed the level
    // with the given number of shots.
    ret.computeStars = (shots) => {
        for (let i = 0; i < level.stars.length; i++) {
            if (shots <= level.stars[i]) {
                return level.stars.length - i;
            }
        }
        return 0;
    };

    // Removes any internal event handler that this level might have.
    ret.stop = () => {
        ret.timeline.stop();
    };

    return ret;

};
