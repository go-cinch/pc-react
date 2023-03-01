import React from 'react';
import { useAppSelector } from 'modules/store';
import { userInfo } from 'modules/user';

interface IPermissionProps {
  btn?: string;
}

const Permission = (props: React.PropsWithChildren<IPermissionProps>) => {
  const { btn, children } = props;
  const info = useAppSelector(userInfo);
  const { btns } = info.permission;
  if (btn && btn !== '' && (btns.includes('*') || btns.includes(btn))) {
    return <>{children}</>;
  }
  return <></>;
};

export default React.memo(Permission);
