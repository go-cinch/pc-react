import React, { useState, memo, useEffect, useRef } from 'react';
import { Table, Dialog, Row, Link, Form, Input, Button, SelectInput, Checkbox, MessagePlugin } from 'tdesign-react';
import { FormInstanceFunctions } from 'tdesign-react/es/form/type';
import { useAppDispatch, useAppSelector } from 'modules/store';
import SearchForm from './components/SearchForm';

import classnames from 'classnames';
import CommonStyle from '../../../styles/common.module.less';
import { create, deleteByIds, find, reset, selectSystemUserGroup, update } from 'modules/system/userGroup';
import { find as findUser } from 'modules/system/user';
import { find as findAction } from 'modules/system/action';
import { PAGE } from '../../../constants';
import { idempotent } from '../../../modules/global/idempotent';
import Permission from 'components/Permission';

const { FormItem } = Form;

interface IProps {
  edit?: boolean;
  delete?: boolean;
  row?: any;
}

export const SelectTable = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectSystemUserGroup);
  const { page, list } = state;
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const [idempotentToken, setIdempotentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteDialogHeader, setDeleteDialogHeader] = useState('');
  const [deleteDialogRow, setDeleteDialogRow] = useState<any>({});
  const [editDialogType, setEditDialogType] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogRow, setEditDialogRow] = useState<any>({});
  const [userSelectChecked, setUserSelectChecked] = useState<any[]>([]);
  const [userSelectOptions, setUserSelectOptions] = useState<any[]>([]);
  const [actionSelectChecked, setActionSelectChecked] = useState<any[]>([]);
  const [actionSelectOptions, setActionSelectOptions] = useState<any[]>([]);

  const editFormRef = useRef<FormInstanceFunctions>();

  useEffect(() => {
    fetchData();
    return () => {
      dispatch(reset());
    };
  }, []);

  const fetchData = async (params?: any) => {
    const p = {
      'page.num': page.num,
      'page.size': page.size,
      ...params,
    };
    try {
      setLoading(true);
      const res: any = await dispatch(find(p));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (params?: any) => {
    const p = {
      'page.num': PAGE.NUM,
      'page.size': PAGE.SIZE,
      ...params,
    };
    try {
      setUserLoading(true);
      const res: any = await dispatch(findUser(p));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      const { list } = res.payload;
      const arr = [];
      for (const k in list) {
        arr.push({
          label: `${list[k].username}[${list[k].code}]`,
          value: list[k].id,
        });
      }
      setUserSelectOptions(arr);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchActionData = async (params?: any) => {
    const p = {
      'page.num': PAGE.NUM,
      'page.size': PAGE.SIZE,
      ...params,
    };
    try {
      setActionLoading(true);
      const res: any = await dispatch(findAction(p));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      const { list } = res.payload;
      const arr = [];
      for (const k in list) {
        arr.push({
          label: `${list[k].word}[${list[k].name}]`,
          value: list[k].code,
        });
      }
      setActionSelectOptions(arr);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchIdempotentData = async () => {
    try {
      const res: any = await dispatch(idempotent());
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      setIdempotentToken(res.payload.token);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    }
  };

  function onSelectChange(value: (string | number)[]) {
    setSelectedRowKeys(value);
  }

  async function doSearch(params: any) {
    await fetchData(params);
  }

  async function handleCreate() {
    editFormRef.current?.reset();
    await fetchIdempotentData();
    setEditDialogType(false);
    setEditDialogVisible(true);
  }

  async function handleDelete() {
    if (selectedRowKeys.length === 0) {
      MessagePlugin.warning('请至少选择一条数据');
      return;
    }
    try {
      setBatchDeleteLoading(true);
      const res: any = await dispatch(deleteByIds(selectedRowKeys));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      MessagePlugin.success('删除成功');
      await fetchData();
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setSelectedRowKeys([]);
      setBatchDeleteLoading(false);
    }
  }

  async function handleRowEdit(row: any) {
    editFormRef.current?.reset();
    editFormRef.current?.setFieldsValue(row);
    setUserSelectChecked([]);
    setActionSelectChecked([]);
    await fetchUserData();
    await fetchActionData();
    const arr1: any[] = [];
    for (const k in row.users) {
      const user = row.users[k];
      const item = arr1.find((item: any) => item.value === user.id);
      if (!item) {
        arr1.push({
          label: `${user.username}[${user.code}]`,
          value: user.id,
        });
      }
    }
    const arr2: any[] = [];
    for (const k in row.actions) {
      const action = row.actions[k];
      const item = arr2.find((item: any) => item.value === action.code);
      if (!item) {
        arr2.push({
          label: `${action.word}[${action.name}]`,
          value: action.code,
        });
      }
    }
    setUserSelectChecked(arr1);
    setActionSelectChecked(arr2);
    setEditDialogRow(row);
    setEditDialogType(true);
    setEditDialogVisible(true);
  }

  function handleRowDelete(row: any) {
    setDeleteDialogHeader(`删除"${row.word}", 不可恢复?`);
    setDeleteDialogRow(row);
    setDeleteDialogVisible(true);
  }

  async function handleRowDeleteConfirm() {
    try {
      setEditLoading(true);
      const res: any = await dispatch(deleteByIds([deleteDialogRow.id]));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      MessagePlugin.success('删除成功');
      await fetchData();
      setDeleteDialogVisible(false);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setEditLoading(false);
    }
  }

  function handleRowDeleteClose() {
    setDeleteDialogVisible(false);
  }

  async function handleEditDialogConfirm() {
    if (await editFormRef.current?.validate()) {
      const fields = editFormRef.current?.getFieldsValue?.(true);
      if (editDialogType) {
        const params: any = {};
        for (const key in fields) {
          if (fields[key] !== '') {
            params[key] = fields[key];
          }
        }
        params.id = editDialogRow.id;
        params.users = '';
        if (userCheckboxChecked.length > 0) {
          params.users = userCheckboxChecked.join(',');
        }
        params.action = '';
        if (actionCheckboxChecked.length > 0) {
          params.action = actionCheckboxChecked.join(',');
        }

        try {
          setEditLoading(true);
          const res: any = await dispatch(update(params));
          if (res.error?.message) {
            throw new Error(res.error?.message);
          }
          MessagePlugin.success('修改成功');
          await fetchData();
          setEditDialogVisible(false);
        } catch (e: any) {
          MessagePlugin.error(e.message);
        } finally {
          setEditLoading(false);
        }
      } else {
        const params: any = {
          data: {
            ...fields,
          },
          token: idempotentToken,
        };
        try {
          setEditLoading(true);
          const res: any = await dispatch(create(params));
          if (res.error?.message) {
            throw new Error(res.error?.message);
          }
          MessagePlugin.success('新建成功');
          await fetchData();
          setEditDialogVisible(false);
        } catch (e: any) {
          MessagePlugin.error(e.message);
        } finally {
          setEditLoading(false);
        }
      }
    }
  }

  const userTagChange = async (currentTags: any, context: any) => {
    const { trigger, index } = context;
    if (trigger === 'clear') {
      setUserSelectChecked([]);
      await fetchUserData();
    }
    if (['tag-remove', 'backspace'].includes(trigger)) {
      const newValue = [...userSelectChecked];
      newValue.splice(index, 1);
      setUserSelectChecked(newValue);
    }
  };

  async function userSelectChange(keyword: any) {
    if (keyword === '') {
      return;
    }
    await fetchUserData({
      word: keyword,
    });
  }

  const userSelectCheckedChange = (val: any, { current, type }: any) => {
    if (type === 'check') {
      const option = userSelectOptions.find((t) => t.value === current);
      setUserSelectChecked(userSelectChecked.concat(option));
    } else {
      const newValue = userSelectChecked.filter((v) => v.value !== current);
      setUserSelectChecked(newValue);
    }
  };

  const getUserCheckboxChecked = () => {
    const arr = [];
    const list = userSelectChecked;
    for (let i = 0, len = list.length; i < len; i++) {
      if (list[i].value) {
        arr.push(list[i].value);
      }
    }
    return arr;
  };

  const userCheckboxChecked = getUserCheckboxChecked();

  const actionTagChange = async (currentTags: any, context: any) => {
    const { trigger, index } = context;
    if (trigger === 'clear') {
      setActionSelectChecked([]);
      await fetchActionData();
    }
    if (['tag-remove', 'backspace'].includes(trigger)) {
      const newValue = [...actionSelectChecked];
      newValue.splice(index, 1);
      setActionSelectChecked(newValue);
    }
  };

  async function actionSelectChange(keyword: any) {
    if (keyword === '') {
      return;
    }
    await fetchActionData({
      word: keyword,
    });
  }

  const actionSelectCheckedChange = (val: any, { current, type }: any) => {
    if (type === 'check') {
      const option = actionSelectOptions.find((t) => t.value === current);
      setActionSelectChecked(actionSelectChecked.concat(option));
    } else {
      const newValue = actionSelectChecked.filter((v) => v.value !== current);
      setActionSelectChecked(newValue);
    }
  };

  const getActionCheckboxChecked = () => {
    const arr = [];
    const list = actionSelectChecked;
    for (let i = 0, len = list.length; i < len; i++) {
      if (list[i].value) {
        arr.push(list[i].value);
      }
    }
    return arr;
  };

  const actionCheckboxChecked = getActionCheckboxChecked();

  function handleEditDialogClose() {
    setEditDialogVisible(false);
  }

  function OpBtn(props: IProps) {
    return (
      <>
        <Permission btn='system.user.group.update'>
          <EditBtn {...props} />
        </Permission>
        <Permission btn='system.user.group.delete'>
          <DeleteBtn {...props} />
        </Permission>
      </>
    );
  }

  function EditBtn(props: IProps) {
    const flag = props.edit;
    if (flag) {
      return (
        <Link
          className='t-button-link'
          theme='primary'
          hover='color'
          onClick={() => {
            handleRowEdit(props.row);
          }}
        >
          编辑
        </Link>
      );
    }
    return <></>;
  }

  function DeleteBtn(props: IProps) {
    const flag = props.delete;
    if (flag) {
      return (
        <Link
          className='t-button-link'
          theme='primary'
          hover='color'
          onClick={() => {
            handleRowDelete(props.row);
          }}
        >
          删除
        </Link>
      );
    }
    return <></>;
  }

  return (
    <>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <SearchForm
          onSubmit={doSearch}
          onCreate={handleCreate}
          onDelete={handleDelete}
          deleteLoading={batchDeleteLoading}
        />
      </Row>
      <Table
        loading={loading}
        data={list}
        columns={[
          {
            colKey: 'row-select',
            width: 50,
            type: 'multiple',
            fixed: 'left',
            align: 'left',
          },
          {
            title: '序号',
            width: 220,
            colKey: 'id',
          },
          {
            title: '名称',
            colKey: 'name',
            width: 150,
          },
          {
            title: '关键字',
            width: 150,
            colKey: 'word',
          },
          {
            align: 'left',
            fixed: 'right',
            width: 200,
            colKey: 'op',
            title: '操作',
            cell(record) {
              return (
                <>
                  <OpBtn row={record.row} edit={true} delete={true} />
                </>
              );
            },
          },
        ]}
        rowKey='id'
        selectedRowKeys={selectedRowKeys}
        hover
        onSelectChange={onSelectChange}
        pagination={{
          current: Number(page.num),
          pageSize: Number(page.size),
          total: Number(page.total),
          showJumper: true,
          onCurrentChange(current, pageInfo) {
            fetchData({
              'page.num': pageInfo.current,
              'page.size': pageInfo.pageSize,
            });
          },
          onPageSizeChange(size) {
            fetchData({
              'page.num': 1,
              'page.size': size,
            });
          },
        }}
      />

      <Dialog
        header={editDialogType ? `编辑"${editDialogRow.word}"` : '新增'}
        visible={editDialogVisible}
        onClose={handleEditDialogClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleEditDialogConfirm}>
            确认
          </Button>
        }
      >
        <Form ref={editFormRef}>
          <FormItem label='名称' name='name' initialData={editDialogRow.name}>
            <Input placeholder='请输入名称' clearable />
          </FormItem>
          <FormItem label='关键字' name='word' initialData={editDialogRow.word}>
            <Input placeholder='请输入关键字' clearable />
          </FormItem>
          {editDialogType ? (
            <FormItem label='用户列表' name='users'>
              <div style={{ width: '100%', height: '100%' }}>
                <SelectInput
                  value={userSelectChecked}
                  placeholder='请选择(输入关键词可搜索)'
                  tagInputProps={{ excessTagsDisplayType: 'break-line' }}
                  allowInput
                  multiple
                  clearable
                  loading={userLoading}
                  onTagChange={userTagChange}
                  onInputChange={userSelectChange}
                  panel={
                    userSelectOptions.length ? (
                      <Checkbox.Group
                        value={userCheckboxChecked}
                        options={userSelectOptions}
                        onChange={userSelectCheckedChange}
                      />
                    ) : (
                      <div className={classnames(CommonStyle.selectInputNoData)}>请切换关键词</div>
                    )
                  }
                />
              </div>
            </FormItem>
          ) : (
            <></>
          )}
          {editDialogType ? (
            <FormItem label='授权行为' name='action'>
              <div style={{ width: '100%', height: '100%' }}>
                <SelectInput
                  value={actionSelectChecked}
                  placeholder='请选择(输入关键词可搜索)'
                  tagInputProps={{ excessTagsDisplayType: 'break-line' }}
                  allowInput
                  multiple
                  clearable
                  loading={actionLoading}
                  onTagChange={actionTagChange}
                  onInputChange={actionSelectChange}
                  panel={
                    actionSelectOptions.length ? (
                      <Checkbox.Group
                        value={actionCheckboxChecked}
                        options={actionSelectOptions}
                        onChange={actionSelectCheckedChange}
                      />
                    ) : (
                      <div className={classnames(CommonStyle.selectInputNoData)}>请切换关键词</div>
                    )
                  }
                />
              </div>
            </FormItem>
          ) : (
            <></>
          )}
        </Form>
      </Dialog>
      <Dialog
        header={deleteDialogHeader}
        visible={deleteDialogVisible}
        onClose={handleRowDeleteClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleRowDeleteConfirm}>
            确认
          </Button>
        }
      />
    </>
  );
};

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
