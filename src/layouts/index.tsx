import React, { memo, useEffect } from 'react';
import { Drawer, Layout } from 'tdesign-react';
import { useNavigate, useLocation } from 'react-router-dom';
import throttle from 'lodash/throttle';
import { useAppSelector, useAppDispatch } from 'modules/store';
import { selectGlobal, toggleSetting, toggleMenu, ELayout, switchTheme } from 'modules/global';
import Setting from './components/Setting';
import AppLayout from './components/AppLayout';
import Style from './index.module.less';
import { info as getUserInfo, permissionMenuPaths, TOKEN_NAME, userInfo, userInfoError } from '../modules/user';

export default memo(() => {
  const globalState = useAppSelector(selectGlobal);
  const dispatch = useAppDispatch();

  const AppContainer = AppLayout[globalState.isFullPage ? ELayout.fullPage : globalState.layout];

  const location = useLocation();
  const navigate = useNavigate();
  const info = useAppSelector(userInfo);
  const infoError = useAppSelector(userInfoError);
  if (infoError && location.pathname !== '/login') {
    navigate('/login');
  }
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_NAME);
    if ((!token || token === '') && location.pathname !== '/login') {
      navigate('/login');
      return;
    }
    if (token && token !== '' && info.id === '') {
      // token is not empty but user info is empty, reload user info
      dispatch(getUserInfo());
      return;
    }
    if (info.id !== '' && location.pathname !== '/login') {
      const paths = permissionMenuPaths(info.permission.menus);
      if (paths.length === 0) {
        navigate('/login');
        return;
      }
      if (!paths.includes(location.pathname)) {
        navigate(paths[0]);
      }
    }
  });

  useEffect(() => {
    dispatch(switchTheme(globalState.theme));
    const handleResize = throttle(() => {
      if (window.innerWidth < 900) {
        dispatch(toggleMenu(true));
      } else if (window.innerWidth > 1000) {
        dispatch(toggleMenu(false));
      }
    }, 100);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Layout className={Style.panel}>
      <AppContainer />
      <Drawer
        destroyOnClose
        visible={globalState.setting}
        size='458px'
        footer={false}
        header='页面配置'
        onClose={() => dispatch(toggleSetting())}
      >
        <Setting />
      </Drawer>
    </Layout>
  );
});
