import { LOAD_CART, ADD_PRODUCT, REMOVE_PRODUCT, CHANGE_PRODUCT_QUANTITY } from '../Actions/actionTypes';

const initialState = {
    products: []
};

export default function (state = initialState, action) {
    switch (action.type) {
        case LOAD_CART:
            return Object.assign({}, state, { products: action.payload })
        case ADD_PRODUCT:
            return Object.assign({}, state, { productToAdd: Object.assign({}, action.payload) })
        case REMOVE_PRODUCT:
            return Object.assign({}, state, { productToRemove: Object.assign({}, action.payload) })
        case CHANGE_PRODUCT_QUANTITY:
            return Object.assign({}, state, { productToChange: Object.assign({}, action.payload) })
        default:
            return state;
    }
}
