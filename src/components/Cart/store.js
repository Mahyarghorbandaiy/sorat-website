import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './Reducers/index';

const initialState = JSON.parse(window.localStorage.getItem('state')) || initialState;

const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk)
);

store.subscribe(() => {
  const state = store.getState();
  const persist = {
    cart: state.cart,
    total: state.total
  };

  window.localStorage.setItem('state', JSON.stringify(persist));
});

export default store;
