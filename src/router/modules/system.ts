import { lazy } from 'react';
import { SettingIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const system: IRouter[] = [
  {
    path: '/system',
    meta: {
      title: '系统',
      Icon: SettingIcon,
    },
    children: [
      {
        path: 'user',
        Component: lazy(() => import('pages/System/User')),
        meta: {
          title: '用户',
        },
      },
      {
        path: 'group',
        Component: lazy(() => import('pages/System/Group')),
        meta: {
          title: '用户组',
        },
      },
      {
        path: 'role',
        Component: lazy(() => import('pages/System/Role')),
        meta: {
          title: '角色',
        },
      },
    ],
  },
];

export default system;
