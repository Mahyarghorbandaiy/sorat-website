import { combineReducers } from "redux";
import cartReducers from "./reducer";
import totalReducer from '../total/reducer'

export default combineReducers({
    cart: cartReducers,
    total: totalReducer,
});