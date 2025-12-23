import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
import DoctorSlice from './slices/DoctorSlice'
import NotificationSlice from './slices/NotificationSlice'

export const store = configureStore({
    reducer: {
        user: UserSlice,
        doctor: DoctorSlice,
        notification: NotificationSlice
    }
})