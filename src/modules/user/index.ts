import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { login as remoteLogin, userInfo as remoteUserInfo, userStatus as remoteStatus } from 'services/user';
import allRoutes, { IRouter } from 'router';
import { UserInfoReply } from 'services/model/userModel';

const namespace = 'user';
export const TOKEN_NAME = 'tdesign-starter';

const InitUserInfo: UserInfoReply = {
  id: '',
  username: '',
  code: '',
  permission: {
    resources: [],
    menus: [],
    btns: [],
  },
};

const initialState = {
  token: localStorage.getItem(TOKEN_NAME) || 'main_token', // 默认token不走权限
  userInfo: { ...InitUserInfo },
  error: false,
};

// login
export const login = createAsyncThunk(`${namespace}/login`, async (userInfo: Record<string, unknown>) => {
  const res = await remoteLogin(userInfo);
  return res.token;
});

// login
export const status = createAsyncThunk(`${namespace}/status`, async (data: any) => {
  const res = await remoteStatus(data);
  return res;
});

// info
export const info = createAsyncThunk(`${namespace}/getInfo`, async () => {
  const res = await remoteUserInfo();
  return res;
});

export const permissionMenus = (menus: string[]) => {
  const routes: IRouter[] = [];
  const all = allRoutes;
  if (menus.includes('*')) {
    all.forEach((route) => {
      routes.push(route);
    });
  } else {
    all.forEach((route) => {
      const children: IRouter[] = [];
      route.children?.forEach((childRouter) => {
        const menu = `${route.path}/${childRouter.path}`;
        if (menus.indexOf('*') !== -1 || menus.indexOf(menu) !== -1) {
          children.push(childRouter);
        }
      });
      if (children.length > 0) {
        route.children = children;
        routes.push(route);
      }
    });
  }
  return routes;
};

export const permissionMenuPaths = (menus: string[]) => {
  const routes: string[] = [];
  const all = allRoutes;
  if (menus.includes('*')) {
    all.forEach((route) => {
      routes.push(route.path);
      route.children?.forEach((childRouter) => {
        const menu = `${route.path}/${childRouter.path}`;
        if (menus.indexOf('*') !== -1 || menus.indexOf(menu) !== -1) {
          routes.push(menu);
        }
      });
    });
  } else {
    all.forEach((route) => {
      route.children?.forEach((childRouter) => {
        const menu = `${route.path}/${childRouter.path}`;
        if (menus.indexOf('*') !== -1 || menus.indexOf(menu) !== -1) {
          routes.push(menu);
        }
      });
    });
  }
  return routes;
};

const userSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(TOKEN_NAME);
      state.token = '';
      state.userInfo = { ...InitUserInfo };
    },
    remove: (state) => {
      state.token = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem(TOKEN_NAME, action.payload);

        state.token = action.payload;
      })
      .addCase(info.pending, (state) => {
        state.error = false;
      })
      .addCase(info.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.userInfo = { ...action.payload };
      })
      .addCase(info.rejected, (state) => {
        state.error = true;
        localStorage.removeItem(TOKEN_NAME);
      });
  },
});

export const selectListBase = (state: RootState) => state.listBase;
export const userInfo = (state: RootState) => state.user.userInfo;
export const userInfoError = (state: RootState) => state.user.error;

export const { logout, remove } = userSlice.actions;

export default userSlice.reducer;
