export const goToIntro = () => ({ type: 'GO_TO_INTRO' });
export const goToError = () => ({ type: 'GO_TO_ERROR' });
export const goToLevelSelect = () => ({ type: 'GO_TO_LEVEL_SELECT' });
export const goToLevel = (l) => ({ type: 'GO_TO_LEVEL', payload: l });