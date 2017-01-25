import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, thunkMiddleware, loggerMiddleware, RootContainer } from './util/state';
import rootReducer from './app/reducers/root';
import App from './app/App';

import styles from './css/index.scss';

import 'isomorphic-fetch';

// Creates the global store
const store = createStore(rootReducer, [ thunkMiddleware, loggerMiddleware ]);

ReactDOM.render(
    <RootContainer store={store}>
        <App />
    </RootContainer>
, document.getElementById('game-area'));