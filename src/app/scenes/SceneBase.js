import Tween from '../../util/Tween';

/**
 * Base class for all the scenes of the game.
 * Provides basic functionalities such as scene transition and timer management.
 * 
 * @class
 */
export default class SceneBase {

    /**
     * Creates a scene for the given application instance.
     * 
     * @param {App} app - Application instance.
     */
    constructor(app) {
        this.app = app;
        this.tweens = [];
    }

    /**
     * Updates this scene and re-renders it.
     * 
     * @param {object} delta - Object with the properties `delta` and `lastDelta`.
     */
    update(delta) {

        // Clears the canvas
        const context = this.app.context;
        context.globalCompositeOperation = 'source-in';
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, this.app.canvas.width, this.app.canvas.height);
        context.globalCompositeOperation = 'source-over';

        // Updates all the tweens
        this.tweens.forEach(t => t.update(delta.delta));

    }

    /**
     * Adds a tween to this scene.
     * It gets removed automatically when it fires the `end` event.
     * 
     * @param {Tween|object} t - Tween object to add. If `t` is not a `Tween` object,
     *        it is used to construct a new one.
     * @param {function} [cb] - Callback to add automatically for the `change` event of the tween
     *        if the given object `t` is no alread a `Tween`.
     */
    addTween(t, cb) {

        const tween = t instanceof Tween ? t : new Tween(t).onChange(cb);
        this.tweens.push(tween);

        tween.on('end', () => {
            this.tweens.splice(this.tweens.indexOf(tween), 1);
        });

    }

};