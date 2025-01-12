export const LOCKED_OPTIONS = [
  { value: false, label: '正常' },
  { value: true, label: '已锁定' },
];

// 通用请求头
export enum ContentTypeEnum {
  Json = 'application/json;charset=UTF-8',
  FormURLEncoded = 'application/x-www-form-urlencoded;charset=UTF-8',
  FormData = 'multipart/form-data;charset=UTF-8',
}

export const PAGE = {
  NUM: '1',
  SIZE: '20',
};

export const WHITELIST_OPTIONS = [
  { value: 0, label: 'permission' },
  { value: 1, label: 'jwt' },
];
