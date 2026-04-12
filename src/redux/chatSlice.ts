import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    unreadCounts: Record<string, number>;
}

const initialState: ChatState = {
    unreadCounts: {},
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        incrementUnreadCount: (state, action: PayloadAction<string>) => {
            const rideId = action.payload;
            state.unreadCounts[rideId] = (state.unreadCounts[rideId] || 0) + 1;
        },
        resetUnreadCount: (state, action: PayloadAction<string>) => {
            const rideId = action.payload;
            state.unreadCounts[rideId] = 0;
        },
        clearAllUnread: (state) => {
            state.unreadCounts = {};
        },
    },
});

export const { incrementUnreadCount, resetUnreadCount, clearAllUnread } = chatSlice.actions;
export default chatSlice.reducer;
