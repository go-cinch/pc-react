import { request } from '../utils/request';
import { FindRoleReply } from './model/roleModel';

const Api = {
  CreateRole: '/auth/role',
  FindRole: '/auth/role',
  UpdateRole: '/auth/role',
  DeleteRole: '/auth/role',
};

export function createRole(token: string, data: any) {
  return request.post({
    url: Api.CreateRole,
    data,
    headers: {
      'x-idempotent': token,
    },
  });
}

export function findRole(params: any) {
  return request.get<FindRoleReply>({
    url: Api.FindRole,
    params,
  });
}

export function updateRole(data: any) {
  return request.patch({
    url: `${Api.UpdateRole}/${data.id}`,
    data,
  });
}

export function deleteRole(ids: any[]) {
  return request.delete({
    url: `${Api.DeleteRole}/${ids.join(',')}`,
  });
}
