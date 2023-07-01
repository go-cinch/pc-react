import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import global from './global';
import globalIdempotent from './global/idempotent';
import user from './user';
import listBase from './list/base';
import listSelect from './list/select';
import listCard from './list/card';
import systemUser from './system/user';
import systemUserGroup from './system/userGroup';
import systemRole from './system/role';
import systemAction from './system/action';
import systemWhitelist from './system/whitelist';

const reducer = combineReducers({
  global,
  globalIdempotent,
  user,
  listBase,
  listSelect,
  listCard,
  systemUser,
  systemUserGroup,
  systemRole,
  systemAction,
  systemWhitelist,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
