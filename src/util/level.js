/**
 * Set of helpers to manage levels.
 */

import { Body, BodyFactory, Vector } from 'phy6-js';
import EventEmitter from 'eventemitter3';
import extend from 'extend';

const WALLS_WIDTH = 20;
const HERO_SIZE = 20;
const COIN_RADIUS = 7;
const GOAL_RADIUS = 15;

/**
 * Transforms the object description of a level in actual bodies for the physics.
 * Returns an object that fires important events for the game.
 * 
 * @param {object} desc - Description of the level to build.
 * @param {Engine} engine - Physics engine that runs the simulation.
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
export const buildLevel = (level, engine) => {
    
    const bodies = engine.bodies;

    // Defaults
    level = extend({
        worldSize: {
            width: 600,
            height: 440
        },
        coins: [],
        walls: []
    }, level);

    // Creates the EventEmitter that we will return
    const ret = new EventEmitter();

    // First of all, create the cage that represents our world bounds
    bodies.push(...BodyFactory.cage(
        0,
        0,
        level.worldSize.width + 2 * WALLS_WIDTH,
        level.worldSize.height + 2 * WALLS_WIDTH,
        WALLS_WIDTH,
        { isStatic: true }
    ));

    // The hero
    const hero = BodyFactory.rect(
        level.heroPosition.x - HERO_SIZE / 2,
        level.heroPosition.y - HERO_SIZE / 2,
        HERO_SIZE,
        HERO_SIZE
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
    goal.on('collision', collision => {
        if (collision.body1 === hero || collision.body2 === hero) {
            ret.emit('won');
        }
    });

    // The coins
    ret.coinsCollected = 0;
    ret.totalCoins = level.coins.length;
    bodies.push(...level.coins.map(c => {
        const coin = BodyFactory.circle(c.x, c.y, COIN_RADIUS, { isTrigger: true });
        coin.on('collision', collision => {
            if (collision.body1 === hero || collision.body2 === hero) {
                bodies.splice(bodies.indexOf(coin), 1);
                ret.coinsCollected++;
                ret.emit('coinCollected', coin);

                // Add the goal to the world if all the coins have been collected
                if (ret.coinsCollected === level.coins.length) {
                    bodies.push(goal);
                }

            }
        });
        return coin;
    }))

    // The walls
    bodies.push(...level.walls.map(w => {
        const absoluteVertices = w.map(p => new Vector(p.x, p.y));
        let c = w.reduce((a, b) => [ a[0] + b.x, a[1] + b.y ], [ 0, 0 ]);
        c = new Vector(c[0] / w.length, c[1] / w.length);
        const relativeVertices = absoluteVertices.map(x => x.sub(c)); 
        return new Body({
            position: c,
            vertices: relativeVertices,
            isStatic: true
        });
    }));

    // Public methods
    ret.computeStars = (shots) => {
        for (let i = 0; i < level.stars.length; i++) {
            if (shots <= level.stars[i]) {
                return level.stars.length - i;
            }
        }
        return 0;
    };

    return ret;

};
