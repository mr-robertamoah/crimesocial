import { createSlice } from "@reduxjs/toolkit";

export const postsSlice = createSlice({
    name: 'post',
    initialState: [],
    reducers: {
        updatePosts: (state, action) =>{
            if (!action?.payload) return state
            const newPosts = action.payload.filter(i => !state.some(j => j.id == i.id))
            state.push(...newPosts)
        },
        updatePost: (state, action) =>{
            if (!action?.payload) return state
            state.splice(state.findIndex(post => post.id == action.payload.id), 1)
            
            state.unshift(action.payload)
        },
        addPost: (state, action) =>{
            if (!action?.payload) return state
            state.unshift(action.payload)
        },
    }
})

export const { updatePosts, updatePost, addPost } = postsSlice.actions

export default postsSlice.reducer