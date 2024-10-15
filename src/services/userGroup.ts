import { request } from '../utils/request';
import { FindUserGroupReply } from './model/userGroupModel';

const Api = {
  CreateUserGroup: '/auth/user/group/create',
  FindUserGroup: '/auth/user/group/list',
  UpdateUserGroup: '/auth/user/group/update',
  DeleteUserGroup: '/auth/user/group/delete',
};

export function createUserGroup(token: string, data: any) {
  return request.post({
    url: Api.CreateUserGroup,
    data,
    headers: {
      'x-idempotent': token,
    },
  });
}

export function findUserGroup(params: any) {
  return request.get<FindUserGroupReply>({
    url: Api.FindUserGroup,
    params,
  });
}

export function updateUserGroup(data: any) {
  return request.patch({
    url: Api.UpdateUserGroup,
    data,
  });
}

export function deleteUserGroup(ids: any[]) {
  return request.delete({
    url: `${Api.DeleteUserGroup}?ids=${ids.join(',')}`,
  });
}
