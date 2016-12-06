export const updateLevels = () => dispatch => {
    return fetch('/assets/levels.json')
        .then(res => res.json())
        .then(l => dispatch({ type: 'UPDATE_LEVELS', payload: l }));
};