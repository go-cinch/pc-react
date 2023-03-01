import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { authIdempotent } from '../../services/idempotent';

const namespace = 'global/idempotent';

interface IInitialState {
  token: string;
}

const initialState: IInitialState = {
  token: '',
};

export const idempotent = createAsyncThunk(`${namespace}/idempotent`, async () => {
  const res = await authIdempotent();
  return res;
});

const globalIdempotentSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(idempotent.fulfilled, (state, action) => {
      state.token = action.payload.token;
    });
  },
});

export const selectGlobalIdempotent = (state: RootState) => state.globalIdempotent;

export default globalIdempotentSlice.reducer;
