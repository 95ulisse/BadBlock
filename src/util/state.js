/**
 * Simple state management library for React.
 * It's actually a simpler version of Redux and React-Redux.
 */

import React, { PropTypes } from 'react';

/**
 * Creates a new store.
 * A store is a container for the state of the application.
 * It's by definition immutable, and can be mutated only by dispatching actions:
 * the reducer will then handle the action by returning the next state.
 * 
 * The store is an object with the following methods:
 * - `subscribe`: Registers a listener for state changes.
 * - `dispatch`: Dispatches a new action.
 * - `getState`: Resturns the current state of the store.
 * 
 * @param {function} reducer - Reducer function for this store.
 * @param {function[]} middlewares - Array of middleware functions to enhance
 *        the `dispatch` function of this store.
 * @returns The newly created store.
 */
const createStore = (reducer, middlewares) => {
    let state;
    const listeners = [];
    const store = {
        subscribe(listener) {
            listeners.push(listener);
            return () => {
                listeners.splice(listeners.indexOf(listener), 1);
            };
        },
        dispatch(action) {
            state = reducer(state, action);
            listeners.forEach(l => l(state));
        },
        getState() {
            return state;
        }
    };

    // Now we need to apply the middlewares
    if (middlewares.length) {
        let dispatch = store.dispatch;

        if (middlewares.length === 1) {
            dispatch = middlewares[0](store)(dispatch);
        } else {
            const stack = middlewares.map(m => m(store));
            const last = stack[stack.length - 1];
            const rest = stack.slice(0, -1);

            dispatch = rest.reduceRight((reduced, m) => m(reduced), last(dispatch));
        }

        store.dispatch = dispatch;
    }

    // Dispatch a fake action to build the initial state tree
    store.dispatch({ type: null });

    return store;
};

/**
 * Helper function that creates a reducer out of a group of other reducers.
 * 
 * @param {object} reducers - Map that describes how the state should be split
 *        between the reducers. Each key of the `reducers` map represents
 *        the corresponding key on the state to pass to the reducer.
 * @returns {function} The reducer function.
 */
const combineReducers = (reducers) => (state = {}, action) => {
    const newState = {};
    Object.keys(reducers).forEach(k => newState[k] = reducers[k](state[k], action));
    return newState;
};

/**
 * Thunk middleware that allows actions to be functions.
 * The return value of these function will be the return value of the `dispatch` method.
 */
const thunkMiddleware = store => next => action => {
    if (typeof action === 'function') {
        return action(store.dispatch, store.getState);
    } else {
        return next(action);
    }
};

/**
 * Simple logger middleware that logs every state change to the console.
 */
const loggerMiddleware = store => next => action => {
    
    const prevState = store.getState();
    const ret = next(action);

    console.groupCollapsed(`%cAction @ ${new Date()} ${action.type}`, 'font-weight: bold');
    console.info('%cPrev state', 'font-weight: bold; color: #9E9E9E', prevState);
    console.info('%cAction', 'font-weight: bold; color: #03A9F4', action);
    console.info('%cNew state', 'font-weight: bold; color: #4CAF50', store.getState());
    console.groupEnd();

    return ret;
};

/**
 * React component used as a glue between the store and the application.
 */
const RootContainer = class RootContainer extends React.Component {

    static propTypes = {
        store: PropTypes.shape({
            subscribe: PropTypes.func.isRequired,
            dispatch: PropTypes.func.isRequired,
            getState: PropTypes.func.isRequired
        }).isRequired,
        children: PropTypes.node
    };

    static childContextTypes = {
        store: PropTypes.shape({
            subscribe: PropTypes.func.isRequired,
            dispatch: PropTypes.func.isRequired,
            getState: PropTypes.func.isRequired
        }).isRequired
    };

    getChildContext() {
        return { store: this.props.store };
    }

    render() {
        return this.props.children;
    }

};

/**
 * Wraps a react component and connects it to the current store.
 * 
 * @param {function} mapStateToProps - Function that maps the current state
 *        to an object representing the props to pass to the component.
 * @param {function} mapDispatchToProps - Function that maps the current dispatch function
 *        to an object representing the props to pass to the component.
 * @returns A function that will wrap React components.
 */
const connect = (mapStateToProps, mapDispatchToProps = (() => {})) => Component =>
    class Connect extends React.Component {
        
        static displayName = `Connect(${Component.displayName || Component.name})`;

        static contextTypes = {
            store: PropTypes.shape({
                subscribe: PropTypes.func.isRequired,
                dispatch: PropTypes.func.isRequired,
                getState: PropTypes.func.isRequired
            }).isRequired
        };

        constructor(props, context) {
            super(props, context);

            const store = context.store;

            this.state = {
                props1: mapStateToProps(store.getState()),
                props2: mapDispatchToProps(store.dispatch)
            };
        }

        componentDidMount() {
            this._unsubscribe = this.context.store.subscribe(newState => {
                this.setState({
                    props1: mapStateToProps(newState)
                })
            });
        }

        componentWillUnmount() {
            this._unsubscribe();
        }

        render() {
            const { props1, props2 } = this.state;
            return <Component {...this.props} {...props1} {...props2} />;
        }

    };

export { createStore, combineReducers, thunkMiddleware, loggerMiddleware, RootContainer, connect };