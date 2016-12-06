import { combineReducers } from '../../util/state';
import app from './app';
import levels from './levels';

// Root reducer that can be applied directly to the store
export default combineReducers({
    app,
    levels
});