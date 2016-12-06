export default (state, action) => {
    if (!state) {
        return { levels: [] };
    }
    switch (action.type) {
        case 'UPDATE_LEVELS':
            return {
                ...state,
                allLevels: action.payload
            };
        default:
            return state;
    }
};