import Tween from '../../util/Tween';
import SceneBase from './SceneBase';

export default class IntroScene extends SceneBase {

    constructor(app) {
        super(app);
        this.addTween({
            startValue: 0,
            endValue: 100,
            duration: 300
        }, x => this._height = x);
        this.addTween({
            startValue: 1,
            endValue: 300,
            duration: 1000,
            startTime: 300,
            easing: 'bounceOut'
        }, x => this._width = x);
    }

    update(delta) {
        super.update(delta);

        const context = this.app.context;

        const centerX = this.app.canvas.width / 2;
        const centerY = this.app.canvas.height / 2;

        context.fillStyle = 'red';
        context.fillRect(centerX - (this._width / 2), centerY - (this._height / 2), this._width, this._height);
    }

};