import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Page } from 'services/model/pageModel';
import { Action } from 'services/model/actionModel';
import { createAction, deleteAction, findAction, updateAction } from 'services/action';
import { PAGE } from '../../constants';

const namespace = 'system/action';

interface IInitialState {
  page: Page;
  list: Action[];
}

const initialState: IInitialState = {
  page: {
    num: PAGE.NUM,
    size: PAGE.SIZE,
    total: '0',
    disable: false,
  },
  list: [],
};

export const find = createAsyncThunk(`${namespace}/find`, async (params: any) => {
  const res = await findAction(params);
  return res;
});

export const update = createAsyncThunk(`${namespace}/update`, async (data: any) => {
  const res = await updateAction(data);
  return res;
});

export const create = createAsyncThunk(`${namespace}/create`, async (params: { token: string; data: any }) => {
  const res = await createAction(params.token, params.data);
  return res;
});

export const deleteByIds = createAsyncThunk(`${namespace}/deleteByIds`, async (data: any) => {
  const res = await deleteAction(data);
  return res;
});

const systemActionSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(find.fulfilled, (state, action) => {
      state.page = action.payload.page;
      state.list = action.payload.list;
    });
  },
});

export const { reset } = systemActionSlice.actions;

export const selectSystemAction = (state: RootState) => state.systemAction;

export default systemActionSlice.reducer;
