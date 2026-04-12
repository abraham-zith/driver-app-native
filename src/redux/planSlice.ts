import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PlanState {
  planId: string | null;
  expiryDate: string | null;
}

const initialState: PlanState = {
  planId: null,
  expiryDate: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    activatePlan: (
      state,
      action: PayloadAction<{planId: string; expiryDate: string}>,
    ) => {
      state.planId = action.payload.planId;
      state.expiryDate = action.payload.expiryDate;
    },
  },
});

export const {activatePlan} = planSlice.actions;
export default planSlice.reducer;
