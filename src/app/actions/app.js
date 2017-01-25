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
            wall: '/assets/wall.png'
        })
        .downloadAll()
        .then(manager => dispatch({ type: 'LOAD_ASSETS', payload: manager }));
};