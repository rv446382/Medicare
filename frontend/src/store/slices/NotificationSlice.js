import { createSlice } from "@reduxjs/toolkit";

const NotificationSlice = createSlice({
    name: "notification",
    initialState: [],
    reducers: {
        addNotification(state, { payload }) {
            const existingIndex = state.findIndex(
                (n) => n.content === payload.content && !n.isRead
            );
            if (existingIndex !== -1) {
                state.splice(existingIndex, 1);
            }

            // Add the new notification at the beginning of the list
            state.unshift({
                isRead: false,
                content: payload.content,
                id: Math.random().toString(32),
                type: payload.type,
                extra: payload.extra,
            });
        },
        updateNotifications(state) {
            state.forEach((n) => (n.isRead = true));
        },
    },
});

export const { addNotification, updateNotifications } = NotificationSlice.actions;
export default NotificationSlice.reducer;
