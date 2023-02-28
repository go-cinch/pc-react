export const BOOL = {
  TRUE: '1',
  FALSE: '0',
};

export const LOCKED_OPTIONS = [
  { value: BOOL.FALSE, label: '正常' },
  { value: BOOL.TRUE, label: '已锁定' },
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
