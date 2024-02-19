import { createSlice } from "@reduxjs/toolkit";

export const postsSlice = createSlice({
    name: 'post',
    initialState: [],
    reducers: {
        updatePosts: (state, action) =>{
            if (!action?.payload) return state
            const newPosts = action.payload.filter(i => state.findIndex(j => j.id == i.id))
            state.push(...newPosts)
        },
        addPost: (state, action) =>{
            if (!action?.payload) return state
            state.unshift(action.payload)
        },
    }
})

export const { updatePosts, addPost } = postsSlice.actions

export default postsSlice.reducer