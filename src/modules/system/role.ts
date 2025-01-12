import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Page } from 'services/model/pageModel';
import { Role } from 'services/model/roleModel';
import { findRole } from 'services/role';
import { PAGE } from '../../constants';
import { createRole, deleteRole, updateRole } from '../../services/role';

const namespace = 'system/role';

interface IInitialState {
  page: Page;
  list: Role[];
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
  const res = await findRole(params);
  return res;
});

export const update = createAsyncThunk(`${namespace}/update`, async (data: any) => {
  const res = await updateRole(data);
  return res;
});

export const create = createAsyncThunk(`${namespace}/create`, async (params: { token: string; data: any }) => {
  const res = await createRole(params.token, params.data);
  return res;
});

export const deleteByIds = createAsyncThunk(`${namespace}/deleteByIds`, async (data: any) => {
  const res = await deleteRole(data);
  return res;
});

const systemRoleSlice = createSlice({
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

export const { reset } = systemRoleSlice.actions;

export const selectSystemRole = (state: RootState) => state.systemRole;

export default systemRoleSlice.reducer;
