import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
    name: 'tokens',
    initialState: {
        accessToken: '',
        refreshToken: ''
    },
    reducers: {
        addTokens: (state, action) =>{
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        clearTokens: (state) =>{
            state.accessToken = ''
            state.refreshToken = ''
        }
    }
})

export const { addTokens, clearTokens } = tokenSlice.actions

export default tokenSlice.reducer