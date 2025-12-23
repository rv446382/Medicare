import { createSlice } from "@reduxjs/toolkit";

const DoctorSlice = createSlice({
    name: 'DoctorSlice',
    initialState: {
        page: 1, 
        data: []
    },
    reducers: {
        addDoctor(state, { payload }) {
            state.data.push(payload.doctor);
            state.page = payload.page;
        },
        removeDoctor(state, { payload }) {
            const index = state.data.findIndex(d => d._id == payload);
            if (index != -1) {
                state.data.splice(index, 1);
            }
        },
        resetDoctor(state, { payload }) {
            state.data = payload.data;
            state.page = payload.page;
        }
    }
})

export const { addDoctor, removeDoctor, resetDoctor } = DoctorSlice.actions;
export default DoctorSlice.reducer;