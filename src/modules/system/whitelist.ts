import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Page } from 'services/model/pageModel';
import { Whitelist } from 'services/model/whitelistModel';
import { createWhitelist, deleteWhitelist, findWhitelist, updateWhitelist } from 'services/whitelist';
import { PAGE } from '../../constants';

const namespace = 'system/whitelist';

interface IInitialState {
  page: Page;
  list: Whitelist[];
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
  const res = await findWhitelist(params);
  return res;
});

export const update = createAsyncThunk(`${namespace}/update`, async (data: any) => {
  const res = await updateWhitelist(data);
  return res;
});

export const create = createAsyncThunk(`${namespace}/create`, async (params: { token: string; data: any }) => {
  const res = await createWhitelist(params.token, params.data);
  return res;
});

export const deleteByIds = createAsyncThunk(`${namespace}/deleteByIds`, async (data: any) => {
  const res = await deleteWhitelist(data);
  return res;
});

const systemWhitelistSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(find.fulfilled, (state, whitelist) => {
      state.page = whitelist.payload.page;
      state.list = whitelist.payload.list;
    });
  },
});

export const { reset } = systemWhitelistSlice.actions;

export const selectSystemWhitelist = (state: RootState) => state.systemWhitelist;

export default systemWhitelistSlice.reducer;
