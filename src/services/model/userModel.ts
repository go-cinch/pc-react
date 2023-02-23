export interface UserLoginReply {
  token: string;
  expires: string;
}

export interface UserCaptchaReply {
  captcha: {
    id: string;
    img: string;
  };
}

export interface UserStatusReply {
  captcha: {
    id: string;
    img: string;
  };
  locked: string;
  lockExpire: string;
}

export interface UserInfoReply {
  id: string;
  username: string;
  code: string;
  permission: {
    resources: Array<string>;
    menus: Array<string>;
    btns: Array<string>;
  };
}

export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  code: string;
  status: string;
  locked: string;
  lastLogin: string;
  lockMsg: string;
  roleId: string;
}

export interface FindUserReply {
  list: Array<User>;
}
