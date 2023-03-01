import { Idempotent } from './model/idempotentModel';
import { request } from '../utils/request';

const Api = {
  AuthIdempotent: '/auth/idempotent',
  // u can add other service idempotent
};

export function authIdempotent() {
  return request.get<Idempotent>({
    url: Api.AuthIdempotent,
  });
}
