import { createSlice } from "@reduxjs/toolkit";

export const countriesSlice = createSlice({
    name: 'countries',
    initialState: [],
    reducers: {
        addCountries(state, action) {
            state.push(...action.payload)
        },
        pushCountries(state, action) {
            state.push(...action.payload)
        },
        removeCountries(state) {
            state = []
        }
    }
})

export const { addCountries, removeCountries, pushCountries } = countriesSlice.actions

export default countriesSlice.reducer