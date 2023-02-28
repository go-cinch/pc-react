import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Page } from 'services/model/pageModel';
import { User, UserCaptchaReply } from 'services/model/userModel';
import { captcha, deleteUser, findUser, register, updateUser } from 'services/user';
import { PAGE } from '../../constants';

const namespace = 'system/user';

interface IInitialState {
  page: Page;
  list: User[];
  captcha: UserCaptchaReply;
}

const initialState: IInitialState = {
  page: {
    num: PAGE.NUM,
    size: PAGE.SIZE,
    total: '0',
    disable: false,
  },
  list: [],
  captcha: {
    captcha: {
      id: '',
      img: '',
    },
  },
};

export const refreshCaptcha = createAsyncThunk(`${namespace}/refreshCaptcha`, async () => {
  const res = await captcha();
  return res;
});

export const find = createAsyncThunk(`${namespace}/find`, async (params: any) => {
  const res = await findUser(params);
  return res;
});

export const update = createAsyncThunk(`${namespace}/update`, async (data: any) => {
  const res = await updateUser(data);
  return res;
});

export const create = createAsyncThunk(`${namespace}/create`, async (data: any) => {
  const res = await register(data);
  return res;
});

export const deleteByIds = createAsyncThunk(`${namespace}/deleteByIds`, async (data: any) => {
  const res = await deleteUser(data);
  return res;
});

const systemUserSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(find.fulfilled, (state, action) => {
        state.page = action.payload.page;
        state.list = action.payload.list;
      })
      .addCase(refreshCaptcha.fulfilled, (state, action) => {
        state.captcha.captcha = action.payload.captcha;
      });
  },
});

export const { reset } = systemUserSlice.actions;

export const selectSystemUser = (state: RootState) => state.systemUser;

export default systemUserSlice.reducer;
