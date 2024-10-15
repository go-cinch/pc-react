import { request } from '../utils/request';
import { FindRoleReply } from './model/roleModel';

const Api = {
  CreateRole: '/auth/role/create',
  FindRole: '/auth/role/list',
  UpdateRole: '/auth/role/update',
  DeleteRole: '/auth/role/delete',
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
    url: Api.UpdateRole,
    data,
  });
}

export function deleteRole(ids: any[]) {
  return request.delete({
    url: `${Api.DeleteRole}?ids=${ids.join(',')}`,
  });
}
