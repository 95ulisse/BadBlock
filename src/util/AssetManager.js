const IMAGES = Symbol('images');
const SOUNDS = Symbol('sounds');
const IMAGES_QUEUE = Symbol('images_queue');
const SOUNDS_QUEUE = Symbol('sounds_queue');

/**
 * Simple asset manager for images and sounds.
 */
export default class AssetManager {

    constructor() {
        this[IMAGES] = {};
        this[SOUNDS] = {};
        this[IMAGES_QUEUE] = [];
        this[SOUNDS_QUEUE] = [];
    }

    /**
     * Queues the images urls for download.
     * 
     * @param {object} images - Object containing the urls of the images to download,
     *        keyed by name
     * @returns {AssetManager} Returns this for chaining.
     */
    queueImages(images) {
        for (let k in images) {
            this[IMAGES_QUEUE].push([ k, images[k] ]);
        }
        return this;
    }

    /**
     * Queues the sounds urls for download.
     * 
     * @param {object} sounds - Object containing the urls of the sounds to download,
     *        keyed by name
     * @returns {AssetManager} Returns this for chaining.
     */
    queueSounds(sounds) {
        for (let k in sounds) {
            this[SOUNDS_QUEUE].push([ k, sounds[k] ]);
        }
        return this;
    }

    /**
     * Starts download of all queued resources.
     * 
     * @returns {Promise} Returns a promise that will be fulfilled when all the downloads complete.
     * It will resolve with the instance of the AssetManager, or fail with the first encountered error.
     */
    downloadAll() {
        let ret = Promise.resolve();
        
        const consumeQueue = (p, q, dest, c) =>
            p.then(() => Promise.all(q.map(req =>
                new Promise((resolve, reject) => {

                    // Construct a new native element and listen for the load and error events
                    const el = new c();
                    el.addEventListener('load', () => {
                        dest[req[0]] = el;
                        resolve();
                    }, false);
                    el.addEventListener('loadeddata', () => {
                        dest[req[0]] = el;
                        resolve();
                    }, false); 
                    el.addEventListener('error', reject, false);
                    el.src = req[1];

                })
            )))
        
        ret = consumeQueue(ret, this[IMAGES_QUEUE], this[IMAGES], Image);
        ret = consumeQueue(ret, this[SOUNDS_QUEUE], this[SOUNDS], Audio);

        this[IMAGES_QUEUE] = [];
        this[SOUNDS_QUEUE] = [];

        return ret.then(() => this);
    }

    /**
     * Retrives the cached image with the given name;
     * 
     * @param {string} name - Name of the image.
     * @returns {Image} Image with the given name.
     */
    getImage(name) {
        return this[IMAGES][name];
    }

    /**
     * Retrives the cached sound with the given name;
     * 
     * @param {string} name - Name of the sound.
     * @returns {Audio} Sound with the given name.
     */
    playSound(name) {
        const sound = this[SOUNDS][name];
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    }

}