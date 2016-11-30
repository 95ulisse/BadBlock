import autobind from 'autobind-decorator';
import { Timer } from 'phy6-js';

import IntroScene from './scenes/Intro';

/**
 * Entry point of the application.
 * Holds the whole state of the game.
 * 
 * @class
 */
export default class App {

    /**
     * Constructs a new instance of the `BadBlock` class.
     * 
     * @param {HTMLCanvasElement} canvas - Canvas to draw the game on.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.timer = new Timer();
        this.timer.on('tick', this._onTick);

        // First scene is Intro
        this.changeScene(new IntroScene(this));
    }

    /**
     * Starts the main game loop.
     */
    start() {
        this.context = this.canvas.getContext("2d");
        this.timer.start();
    }

    /**
     * Stops the main game loop.
     */
    stop() {
        this.timer.stop();
        this.context = null;
    }

    /**
     * Changes the current scene.
     * This method calls the `onUnmount` and `onMount` methods respectively
     * on the old and the new scene.
     * 
     * @param {SceneBase} newScene - New scene to transition to.
     * @returns {Promise<boolean>} Promise that will be fulfilled with a boolean
     *          indicating whether the transition succeeded or not. 
     */
    changeScene(newScene) {

        // Notify the current scene that is going to be unmounted,
        // and give it a possibility to cancel the transition
        let unmountPromise;
        if (this.currentScene && typeof this.currentScene.onUnmount === 'function') {
            const unmountReturn = this.currentScene.onUnmount();

            if (unmountReturn === undefined) {
                unmountPromise = Promise.resolve(true);
            } else {
                unmountPromise = Promise.resolve(unmountReturn);
            }

        } else {
            unmountPromise = Promise.resolve(true);
        }

        // Coerce any error to a failed transition.
        return unmountPromise.then(
            x => !!x,
            err => { console.error('Failed scene transition', err); return false; }
        ).then(doTransition => {

            // Actually do the transition
            if (doTransition) {
                this.currentScene = newScene;
                if (newScene && typeof newScene.onMount === 'function') {
                    newScene.onMount();
                }
            }

            return doTransition;

        });

    }

    /**
     * Private function called on each tick of the timer.
     * 
     * @private
     */
    @autobind
    _onTick(delta) {

        // Update the current scene
        if (this.currentScene) {
            this.currentScene.update(delta);
        }

    }

};