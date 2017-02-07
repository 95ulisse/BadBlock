import React, { Component, PropTypes } from 'react';
import { Vector, Engine, Timer, Renderer } from 'phy6-js';
import autobind from 'autobind-decorator';

import { connect } from '../../util/state';
import * as LevelHelpers from '../../util/level';
import AssetManager from '../../util/AssetManager';
import { interpolators } from '../../util/Tween';

import ChangeAnimation from '../components/ChangeAnimation';
import Stars from '../components/Stars';
import LevelModal from '../components/LevelModal';

import styles from './Level.scss';



const starsComparer = (current, candidate) =>
    current.props.stars != candidate.props.stars;

const relativizeMouseEvent = (e) => {
    
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
    return new Vector(
        e.pageX - offsetX,
        e.pageY - offsetY
    );

};



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
        this.particles = [];
        this.level = LevelHelpers.buildLevel(levelDescription, this.engine, this.timer, this.props.assets, this.particles);

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
                this.mousePos = null;
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
                showAxes: false,
                showVelocities: false
            });
            this.renderer.on('frameDrawn', this.onFrameDrawn);
            this.renderer.start();
            this.renderer.render();
        } else {
            this.canvas = null;
            this.renderer.stop();
        }
    }

    @autobind
    onCanvasMouseMove(e) {

        if (this.state.state != 'playing') {
            return;
        }

        // Update the position of the mouse.
        // At the next tick of the timer, the particles will be redrawn.
        this.mousePos = relativizeMouseEvent(e);

    }

    @autobind
    onCanvasMouseDown(e) {
        const { state, shots } = this.state;

        if (state != 'playing') {
            return;
        }

        // Hit that block!
        this.level.shot(relativizeMouseEvent(e));

        // Increment the shots count
        this.setState({ shots: shots + 1 });

    }

    @autobind
    onFrameDrawn(context) {
        const { mousePos, particles, level: { hero } } = this;        
        
        // Enable additive blending.
        // Particles do not have to completely cover what was previously drawn.
        context.globalCompositeOperation = 'lighter';
        context.globalAlpha = 0.5;

        if (mousePos) {
            const angleToDraw = Math.PI / 8;
            const r = mousePos.sub(hero.position);
            const beginAngle = r.direction() - (angleToDraw / 2) + (r.x < 0 ? Math.PI : 0);
            const endAngle = beginAngle + angleToDraw;

            // Cursor particles
            context.beginPath();
            context.arc(hero.position.x, hero.position.y, r.length(), beginAngle, endAngle);
            context.moveTo(mousePos.x, mousePos.y);
            context.lineTo(hero.position.x, hero.position.y);

            context.strokeStyle = 'white';
            context.lineCap = 'round';
            context.lineWidth = 5;
            context.stroke();

            // Direction prediction.
            // The prediction should be proportional to the strength of the shot.
            const predictionLength = Math.min(200, 100 * 200 * (1 / r.length()));
            const prediction = r.normalize().scalar(-predictionLength).add(hero.position);
            context.beginPath();
            context.moveTo(hero.position.x, hero.position.y);
            context.lineTo(prediction.x, prediction.y);

            context.strokeStyle = interpolators.hsl(
                { h: 120, s: 1, l: 0.5 },
                { h: 0, s: 1, l: 0.5 },
                predictionLength / 200
            );
            context.lineCap = 'butt';
            context.lineWidth = 3;
            context.setLineDash([ 10, 10 ]);
            context.stroke();
            context.setLineDash([]);

        }

        // Draw other particles
        for (const p of particles) {
            p.render(context);
        }

        // And now restore the state of the context
        context.globalAlpha = 1;

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
                modal = (
                    <LevelModal reason="paused" level={level}
                        replayLevel={this.replayLevel}
                        resumeLevel={() => this.changeState('playing')} />
                );
                break;
            
            case 'won':
                modal = <LevelModal reason="won" level={level} shots={shots} replayLevel={this.replayLevel} />;
                break;
            
            case 'lost':
                modal = <LevelModal reason="lost" level={level} replayLevel={this.replayLevel} />;
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
                    {state === 'playing' &&
                        <i className="fa fa-fw fa-pause" onClick={() => this.changeState('paused')} />
                    }
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
                        ref={this.onCanvasRef} onMouseDown={this.onCanvasMouseDown}
                        onMouseMove={this.onCanvasMouseMove}>
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