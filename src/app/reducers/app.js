export default (state, action) => {
    if (!state) {
        return { assets: null, stage: 'loading', currentLevel: -1 };
    }
    switch (action.type) {

        case 'LOAD_ASSETS':
            return {
                ...state,
                assets: action.payload
            };

        case 'GO_TO_INTRO':
            return {
                ...state,
                stage: 'intro'
            };

        case 'GO_TO_ERROR':
            return {
                ...state,
                stage: 'error'
            };

        case 'GO_TO_LEVEL_SELECT':
            return {
                ...state,
                stage: 'levelselect'
            };

        case 'GO_TO_LEVEL':
            return {
                ...state,
                stage: 'level',
                currentLevel: action.payload
            };

        default:
            return state;

    }
};