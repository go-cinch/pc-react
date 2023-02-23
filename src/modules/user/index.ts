import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { login as remoteLogin, userInfo as remoteUserInfo } from 'services/user';
import allRoutes, { IRouter } from '../../router';

const namespace = 'user';
export const TOKEN_NAME = 'tdesign-starter';

const InitUserInfo = {
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
};

// login
export const login = createAsyncThunk(`${namespace}/login`, async (userInfo: Record<string, unknown>) => {
  const res = await remoteLogin(userInfo);
  return res.token;
});

// getUserInfo
export const getUserInfo = createAsyncThunk(`${namespace}/getUserInfo`, async () => {
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
      .addCase(getUserInfo.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        state.userInfo = { ...action.payload };
      });
  },
});

export const selectListBase = (state: RootState) => state.listBase;
export const userInfo = (state: RootState) => state.user.userInfo;

export const { logout, remove } = userSlice.actions;

export default userSlice.reducer;
