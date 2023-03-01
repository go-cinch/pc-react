import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Page } from 'services/model/pageModel';
import { PAGE } from '../../constants';
import { createUserGroup, deleteUserGroup, findUserGroup, updateUserGroup } from 'services/userGroup';
import { UserGroup } from 'services/model/userGroupModel';

const namespace = 'system/user/group';

interface IInitialState {
  page: Page;
  list: UserGroup[];
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
  const res = await findUserGroup(params);
  return res;
});

export const update = createAsyncThunk(`${namespace}/update`, async (data: any) => {
  const res = await updateUserGroup(data);
  return res;
});

export const create = createAsyncThunk(`${namespace}/create`, async (params: { token: string; data: any }) => {
  const res = await createUserGroup(params.token, params.data);
  return res;
});

export const deleteByIds = createAsyncThunk(`${namespace}/deleteByIds`, async (data: any) => {
  const res = await deleteUserGroup(data);
  return res;
});
const systemUserGroupSlice = createSlice({
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

export const { reset } = systemUserGroupSlice.actions;

export const selectSystemUserGroup = (state: RootState) => state.systemUserGroup;

export default systemUserGroupSlice.reducer;
