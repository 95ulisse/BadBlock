import AssetManager from '../../util/AssetManager';

export const goToIntro = () => ({ type: 'GO_TO_INTRO' });
export const goToError = (e) => ({ type: 'GO_TO_ERROR', payload: e });
export const goToLevelSelect = () => ({ type: 'GO_TO_LEVEL_SELECT' });
export const goToLevel = (l) => ({ type: 'GO_TO_LEVEL', payload: l });

export const loadAssets = () => dispatch => {
    return new AssetManager()
        .queueImages({
            coin: '/assets/coin.png',
            goal: '/assets/goal.png',
            wall: '/assets/wall.png',
            spikes: '/assets/spikes.png',
            moon: '/assets/moon.jpg',
            box: '/assets/box.png'
        })
        .queueSounds({
            coin: '/assets/coin.mp3',
            goal: '/assets/goal.mp3',
            hit1: '/assets/hit1.mp3',
            hit2: '/assets/hit2.mp3',
            hit3: '/assets/hit3.mp3',
            hit4: '/assets/hit4.mp3',
            hit5: '/assets/hit5.mp3',
            spikes: '/assets/spikes.mp3',
            win: '/assets/win.mp3'
        })
        .downloadAll()
        .then(manager => dispatch({ type: 'LOAD_ASSETS', payload: manager }));
};