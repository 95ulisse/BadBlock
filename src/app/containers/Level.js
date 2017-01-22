import React, { Component, PropTypes } from 'react';
import { Vector, Engine, Timer, Renderer } from 'phy6-js';
import autobind from 'autobind-decorator';

import { connect } from '../../util/state';
import * as LevelHelpers from '../../util/level';
import AssetManager from '../../util/AssetManager';

import ChangeAnimation from '../components/ChangeAnimation';
import Stars from '../components/Stars';
import LevelCompletedModal from '../components/LevelCompletedModal';

import styles from './Level.scss';

const starsComparer = (current, candidate) =>
    current.props.stars != candidate.props.stars;

@connect(state => ({
    assets: state.app.assets,
    level: state.levels.allLevels[state.app.currentLevel]
}))
export default class Level extends Component {

    static propTypes = {
        assets: PropTypes.instanceOf(AssetManager).isRequired,
        level: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            state: 'beforeStart', // beforeStart | playing | paused | won | lost
            coinsCollected: 0,
            shots: 0
        };

        // These objects reside of the state because they will never change
        this.engine = new Engine();
        this.timer = new Timer({ fps: 60, isFixed: true });

        // Update the physics at every tick
        this.timer.on('tick', this.engine.update.bind(this.engine));

        // Manually build the level the first time
        this.buildLevel();

    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.level === this.props.level) {
            return;
        }

        this.loadLevel(nextProps.level);

    }

    buildLevel(levelDescription = this.props.level) {
        
        // Builds the level
        this.level = LevelHelpers.buildLevel(levelDescription, this.engine, this.timer, this.props.assets);

        // Registers callbacks for the events of our interest
        this.level.on('won', () => this.changeState('won'));
        this.level.on('lost', () => this.changeState('lost'));
        this.level.on('coinCollected', () => {
            this.setState({ coinsCollected: this.level.coinsCollected });
        });

        // If the canvas is already referenced, force a redraw
        if (this.canvas) {
            this.renderer.render();
        }

    }

    loadLevel(levelDescription) {
        
        // Clean the engine, stop the timer, reset everything of the previous level
        if (this.level) {
            this.level.stop();
            this.level.removeAllListeners();
            this.engine.bodies.length = 0;
            this.changeState('beforeStart');
            this.setState({
                coinsCollected: 0,
                shots: 0
            });
        }

        this.buildLevel(levelDescription);

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
    replayLevel() {
        // Reload the same level
        this.loadLevel(this.props.level);
    }

    @autobind
    onCanvasRef(canvas) {
        if (canvas) {
            this.canvas = canvas;
            this.renderer = new Renderer(this.engine, canvas, {
                showAxes: false
            });
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
        const { state, shots } = this.state;

        if (state != 'playing') {
            return;
        }

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

        // Increment the shots count
        this.setState({ shots: shots + 1 });

    }

    render() {

        const level = this.level;
        const { goToLevelSelect } = this.props;
        const { state, coinsCollected, shots } = this.state;

        // Switches on the current state to build the modal
        // that will be drawn above the game area
        let modal;
        switch (state) {
            
            case 'beforeStart':
                modal = <button className="btn" onClick={this.changeState.bind(this, 'playing')}>Click to start</button>;
                break;
            
            case 'playing':
                break;
            
            case 'paused':
                break;
            
            case 'won':
                modal = <LevelCompletedModal level={level} shots={shots} replayLevel={this.replayLevel} />;
                break;
            
            case 'lost':
                modal = <button className="btn">You Lost :(</button>;
                break;
            
        }

        // Top bar with statistics
        let topBar = (
            <div className={styles['top-bar']}>
                <span className={styles['stat']}>
                    <span>Coins:&nbsp;</span>
                    <ChangeAnimation>{coinsCollected}</ChangeAnimation>
                    <span>/{level.totalCoins}</span>
                </span>
                <span className={styles['stat']}>
                    <i className="fa fa-refresh" onClick={this.replayLevel} />
                </span>
                <span className={styles['stat']}>
                    <span>Shots:&nbsp;</span>
                    <ChangeAnimation>{shots}</ChangeAnimation>
                    <ChangeAnimation hasChanged={starsComparer}>
                        <Stars stars={level.computeStars(shots)} maxStars={3} size={25}
                            style={{ marginLeft: '5px' }} />
                    </ChangeAnimation>
                </span>
            </div>
        );

        return (
            <div className={styles['level']}>
                
                {/* Top bar */}
                {topBar}

                {/* Modal container to allow modals to cover only the game canvas.
                    Also, blur the canvas if the modal is visible. */}
                <div className={styles['modal-container']}>

                    {/* Game canvas */}
                    <canvas width="640" height="480" className={modal ? styles['blurred'] : ''}
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

            </div>
        );
    }

};