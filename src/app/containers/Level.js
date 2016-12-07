import React, { Component, PropTypes } from 'react';
import { Vector, Engine, Timer, Renderer } from 'phy6-js';
import autobind from 'autobind-decorator';

import { connect } from '../../util/state';
import * as LevelHelpers from '../../util/level';

import styles from './Level.scss';

@connect(state => ({
    level: state.levels.allLevels[state.app.currentLevel]
}))
export default class Level extends Component {

    static propTypes = {
        level: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            state: 'beforeStart', // beforeStart | playing | paused | won | lost
            coinsCollected: 0
        };

        // These objects reside of the state because they will never change
        this.engine = new Engine();
        this.timer = new Timer();

        // Update the physics at every tick
        this.timer.on('tick', this.engine.update.bind(this.engine));

        // Manually build the level the first time
        this.buildLevel();

    }

    buildLevel() {
        
        // Builds the level
        this.level = LevelHelpers.buildLevel(this.props.level, this.engine);

        // Registers callbacks for the events of our interest
        this.level.on('won', () => this.changeState('won'));
        this.level.on('lost', () => this.changeState('lost'));
        this.level.on('coinCollected', () => {
            this.setState({ coinsCollected: this.level.coinsCollected });
        });

    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.level === this.props.level) {
            return;
        }

        // Clean the engine, stop the timer, reset everything of the previous level
        if (this.level) {
            this.level.removeAllListeners();
            this.engine.bodies.length = 0;
            this.changeState('beforeStart');
        }

        this.buildLevel();

    }

    changeState(newState) {
        const oldState = this.state.state;

        switch (newState) {
            
            case 'playing':
                this.timer.start();
                break;
            
            case 'beforeStart':
            case 'paused':
            case 'won':
            case 'lost':
                this.timer.stop();
                break;

        }

        // Change the state
        this.setState({ state: newState });
    }

    @autobind
    onCanvasRef(canvas) {
        if (canvas) {
            this.canvas = canvas;
            this.renderer = new Renderer(this.engine, canvas);
            this.renderer.start();
            this.renderer.render();
        } else {
            this.canvas = null;
            this.renderer.stop();
        }
    }

    @autobind
    onCanvasMouseDown(e) {
        const hero = this.level.hero;

        // We need to relativize the coordinates, so we traverse the hierarchy
        // to compute the total offset of the element from the document
        let offsetX = 0;
        let offsetY = 0;
        let parent = e.target;
        while (parent) {
            offsetX += parent.offsetLeft;
            offsetY += parent.offsetTop;
            parent = parent.offsetParent;
        }
        const point = new Vector(
            e.pageX - offsetX,
            e.pageY - offsetY
        );

        // Computes the force to apply along the direction
        // connecting the mouse and the center of the body.
        const force =
            hero.position.sub(point)
            .normalize()
            .scalar(0.02);

        // Applies a force to the hero to make it move
        hero.applyForce(force, hero.position);

    }

    render() {

        const { state, coinsCollected } = this.state;

        // Switches on the current state to build the modal
        // that will be drawn above the game area
        let modal;
        switch (state) {
            
            case 'beforeStart':
                modal = <button onClick={this.changeState.bind(this, 'playing')}>Click to start</button>;
                break;
            
            case 'playing':
                break;
            
            case 'paused':
                break;
            
            case 'won':
                modal = <button>You Won!</button>;
                break;
            
            case 'lost':
                modal = <button>You Lost :(</button>;
                break;
            
        }

        return (
            <div className={styles['level']}>
                
                {/* Game canvas */}
                <canvas width="640" height="480"
                    ref={this.onCanvasRef} onMouseDown={this.onCanvasMouseDown}>
                </canvas>

                {/* Modal messages that will apear above the game */}
                {modal &&
                    <div className={styles['modal']}>
                        <div>
                            {modal}
                        </div>
                    </div>
                }

            </div>
        );
    }

};