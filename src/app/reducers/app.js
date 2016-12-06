export default (state, action) => {
    if (!state) {
        return { stage: 'loading' };
    }
    switch (action.type) {

        case 'GO_TO_INTRO':
            return {
                ...state,
                stage: 'intro'
            };

        case 'GO_TO_LEVEL_SELECT':
            return {
                ...state,
                stage: 'levelselect'
            };

        case 'GO_TO_ERROR':
            return {
                ...state,
                stage: 'error'
            };

        default:
            return state;

    }
};