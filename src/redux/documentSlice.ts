

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DocumentStatus = 'not_uploaded' | 'pending' | 'approved';

interface DocumentState {
  status: DocumentStatus;
}

const initialState: DocumentState = {
  status: 'not_uploaded',
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocumentStatus: (state, action: PayloadAction<DocumentStatus>) => {
      state.status = action.payload;
    },
  },
});

export const { setDocumentStatus } = documentSlice.actions;
export default documentSlice.reducer;
