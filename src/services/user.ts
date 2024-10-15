import { request } from '../utils/request';
import {
  FindUserReply,
  UserCaptchaReply,
  UserInfoReply,
  UserLoginReply,
  UserStatusReply,
} from 'services/model/userModel';

const Api = {
  UserLogin: '/auth/pub/login',
  UserCaptcha: '/auth/pub/captcha',
  UserStatus: '/auth/pub/status',
  UserInfo: '/auth/info',
  Register: '/auth/pub/register',
  FindUser: '/auth/user/list',
  UpdateUser: '/auth/user/update',
  DeleteUser: '/auth/user/delete',
};

export function login(data: any) {
  return request.post<UserLoginReply>({
    url: Api.UserLogin,
    data,
  });
}

export function captcha() {
  return request.get<UserCaptchaReply>({
    url: Api.UserCaptcha,
  });
}

export function userStatus(params: any) {
  return request.get<UserStatusReply>({
    url: Api.UserStatus,
    params,
  });
}

export function userInfo() {
  return request.get<UserInfoReply>({
    url: Api.UserInfo,
  });
}

export function register(data: any) {
  return request.post({
    url: Api.Register,
    data,
  });
}

export function findUser(params: any) {
  return request.get<FindUserReply>({
    url: Api.FindUser,
    params,
  });
}

export function updateUser(data: any) {
  return request.patch({
    url: Api.UpdateUser,
    data,
  });
}

export function deleteUser(ids: []) {
  return request.delete({
    url: `${Api.DeleteUser}?ids=${ids.join(',')}`,
  });
}
