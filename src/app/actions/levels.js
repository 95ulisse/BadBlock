import { Engine, Timer, Renderer } from 'phy6-js';
import * as LevelHelpers from '../../util/level';

export const updateLevels = () => dispatch => {
    return fetch('/assets/levels.json?t=' + (new Date().getTime()))
        .then(res => res.json())
        .then(l => dispatch({ type: 'UPDATE_LEVELS', payload: l }));
};

export const generateThumbs = () => (dispatch, getState) => {
    const { app: { assets }, levels: { allLevels } } = getState();

    // Creates an offscreen canvas for rendering
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    // Create also the engine and the timer for the level,
    // even though the timer will never start
    const engine = new Engine();
    const timer = new Timer();
    const renderer = new Renderer(engine, canvas, {
        showAxes: false
    });
    renderer.start();

    // Cycles all the levels and renders each of them in the canvas
    const thumbs = [];
    for (const l of allLevels) {
        const level = LevelHelpers.buildLevel(l, engine, timer, assets, []);
        renderer.render();
        thumbs.push(canvas.toDataURL('image/png'));
        level.stop();
        engine.bodies.length = 0;
    }

    dispatch({ type: 'UPDATE_THUMBS', payload: thumbs });

    return Promise.resolve();
};