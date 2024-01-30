import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../reducers/user.reducer';
import tokensReducer from '../reducers/tokens.reducer';

export default configureStore({
    reducer: {
        user: userReducer,
        tokens: tokensReducer
    },
})