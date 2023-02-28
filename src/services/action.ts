import { request } from '../utils/request';
import { FindActionReply } from './model/actionModel';

const Api = {
  CreateAction: '/auth/action',
  FindAction: '/auth/action',
  UpdateAction: '/auth/action',
  DeleteAction: '/auth/action',
};

export function createAction(token: string, data: any) {
  return request.post({
    url: Api.CreateAction,
    data,
    headers: {
      'x-idempotent': token,
    },
  });
}

export function findAction(params: any) {
  return request.get<FindActionReply>({
    url: Api.FindAction,
    params,
  });
}

export function updateAction(data: any) {
  return request.patch({
    url: `${Api.UpdateAction}/${data.id}`,
    data,
  });
}

export function deleteAction(ids: any[]) {
  return request.delete({
    url: `${Api.DeleteAction}/${ids.join(',')}`,
  });
}
