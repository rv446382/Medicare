import { createSlice } from '@reduxjs/toolkit'

export const USER_TOKEN = '__user_token__';

const UserSlice = createSlice({
    name: 'User', // doctor, user
    initialState: {
        user: null,
        token: '',
        isDoctor: false
    },
    reducers: {
        login(state, { payload }) {
            localStorage.setItem(USER_TOKEN, payload.token);

            state.user = payload.user;
            state.token = payload.token;
            state.isDoctor = payload.isDoctor;
        },
        logout(state) {
            localStorage.removeItem(USER_TOKEN);
            state.user = null;
            state.token = null;
        },
        update(state, { payload }) {
            state.user = payload;
        }
    }
})

export const { login, logout, update } = UserSlice.actions;
export default UserSlice.reducer;