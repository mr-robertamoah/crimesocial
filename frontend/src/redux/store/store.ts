import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../reducers/user.reducer';
import tokensReducer from '../reducers/tokens.reducer';
import countriesReducer from '../reducers/countries.reducer';

export default configureStore({
    reducer: {
        user: userReducer,
        tokens: tokensReducer,
        countries: countriesReducer,
    },
})