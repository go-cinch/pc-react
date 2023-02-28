import { Page } from './pageModel';

export interface Action {
  id: string;
  name: string;
  code: string;
  word: string;
  resource: string;
}

export interface FindActionReply {
  page: Page;
  list: Array<Action>;
}
