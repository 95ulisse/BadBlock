export default (state, action) => {
    if (!state) {
        return { allLevels: [] };
    }
    switch (action.type) {
        case 'UPDATE_LEVELS':
            return {
                ...state,
                allLevels: action.payload
            };
        case 'UPDATE_THUMBS':
            return {
                ...state,
                allLevels: state.allLevels.map((l, i) => ({
                    ...l,
                    thumb: action.payload[i]
                }))
            };
        default:
            return state;
    }
};