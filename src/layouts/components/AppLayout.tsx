import React from 'react';
import { Layout } from 'tdesign-react';
import { useLocation } from 'react-router-dom';
import { ELayout } from 'modules/global';
import Header from './Header';
import Footer from './Footer';
import Menu from './Menu';
import classnames from 'classnames';
import Content from './AppRouter';

import Style from './AppLayout.module.less';
import { useAppSelector } from '../../modules/store';
import { userInfo } from '../../modules/user';

const SideLayout = React.memo(() => {
  const location = useLocation();
  const info = useAppSelector(userInfo);
  if (info.id === '' && location.pathname !== '/login') {
    // no user info, hidden content
    return <Layout className={classnames(Style.sidePanel, 'narrow-scrollbar')} />;
  }
  return (
    <Layout className={classnames(Style.sidePanel, 'narrow-scrollbar')}>
      <Menu showLogo showOperation />
      <Layout className={Style.sideContainer}>
        <Header />
        <Content />
        <Footer />
      </Layout>
    </Layout>
  );
});

const TopLayout = React.memo(() => {
  const location = useLocation();
  const info = useAppSelector(userInfo);
  if (info.id === '' && location.pathname !== '/login') {
    // no user info, hidden content
    return <Layout className={Style.topPanel} />;
  }
  return (
    <Layout className={Style.topPanel}>
      <Header showMenu />
      <Content />
      <Footer />
    </Layout>
  );
});

const MixLayout = React.memo(() => {
  const location = useLocation();
  const info = useAppSelector(userInfo);
  if (info.id === '' && location.pathname !== '/login') {
    // no user info, hidden content
    return <Layout className={Style.mixPanel} />;
  }
  return (
    <Layout className={Style.mixPanel}>
      <Header />
      <Layout className={Style.mixMain}>
        <Menu />
        <Layout className={Style.mixContent}>
          <Content />
          <Footer />
        </Layout>
      </Layout>
    </Layout>
  );
});

const FullPageLayout = React.memo(() => <Content />);

export default {
  [ELayout.side]: SideLayout,
  [ELayout.top]: TopLayout,
  [ELayout.mix]: MixLayout,
  [ELayout.fullPage]: FullPageLayout,
};
