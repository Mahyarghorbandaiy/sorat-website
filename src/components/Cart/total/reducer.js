import { UPDATE_CART } from './actionTypes';

const initialState = {
  data: {
    productQuantity: 0,
    installments: 0,
    totalPrice: 0,
    totalDiscount: 0,
    currencyId: 'CAD',
    currencyFormat: '$'
  }
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_CART:
      return Object.assign({}, state, { data: action.payload });
    default:
      return state;
  }
}
