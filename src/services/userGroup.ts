import { request } from '../utils/request';
import { FindUserGroupReply } from './model/userGroupModel';

const Api = {
  CreateUserGroup: '/auth/user/group',
  FindUserGroup: '/auth/user/group',
  UpdateUserGroup: '/auth/user/group',
  DeleteUserGroup: '/auth/user/group',
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
    url: `${Api.UpdateUserGroup}/${data.id}`,
    data,
  });
}

export function deleteUserGroup(ids: any[]) {
  return request.delete({
    url: `${Api.DeleteUserGroup}/${ids.join(',')}`,
  });
}
