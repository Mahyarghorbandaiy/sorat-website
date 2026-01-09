import { UPDATE_CART } from './actionTypes';

export const updateCart = cartProducts => dispatch => {
  const productQuantity = cartProducts.reduce((sum, p) => {
    sum += p.quantity;
    return sum;
  }, 0);

  const totalPrice = cartProducts.reduce((sum, p) => {
    sum += p.price[0] * p.quantity;
    return sum;
  }, 0);


  let totalDiscount = 0;
  totalDiscount = cartProducts.reduce((sum, p) => {
    if (p.promo && p.promo > 1) {
          sum += p.promo[0] * p.quantity;
    return sum;
    } else {
      sum += p.price[0] * p.quantity;
      return sum;
    }

  }, 0);

  const installments = cartProducts.reduce((greater, p) => {
    greater = p.installments > greater ? p.installments : greater;
    return greater;
  }, 0);

  const cartTotal = {
    productQuantity,
    installments,
    totalPrice,
    totalDiscount,
    currencyId: 'USD',
    currencyFormat: '$'
  };

  dispatch({
    type: UPDATE_CART,
    payload: cartTotal
  });
};
