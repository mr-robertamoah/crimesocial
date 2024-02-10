import { createSlice } from "@reduxjs/toolkit";
export interface UserType {
    id: number | null,
    createdAt: string,
    updatedAt: string,
    email: string | null,
    username: string,
    firstName: string | null,
    lastName: string | null,
    otherNames: string | null,
    gender: string,
    country: string | null,
    avatarUrl: string | null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        id: null,
        createdAt: "",
        updatedAt: "",
        email: null,
        username: "",
        firstName: null,
        lastName: null,
        otherNames: null,
        gender: "UNDISCLOSED",
        country: null,
        avatarUrl: null,
    },
    reducers: {
        addUser: (state, action) =>{
            if (!action?.payload) return state

            state.email = action.payload.email
            state.username = action.payload.username
            state.id = action.payload.id
            state.createdAt = action.payload.createdAt
            state.updatedAt = action.payload.updatedAt
            state.country = action.payload.country
            state.avatarUrl = action.payload.avatarUrl
            state.gender = action.payload.gender
            state.firstName = action.payload.firstName
            state.lastName = action.payload.lastName
            state.otherNames = action.payload.otherNames
        },
        removeUser: (state) => {
            state.id = null
            state.createdAt = ""
            state.updatedAt = ""
            state.email = null
            state.username = ""
            state.firstName = null
            state.lastName = null
            state.otherNames = null
            state.gender = "UNDISCLOSED"
            state.country = null
            state.avatarUrl = null
        }
    }
})

export const { addUser, removeUser } = userSlice.actions

export default userSlice.reducer