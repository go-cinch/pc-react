import React, { useState, memo, useEffect, useRef } from 'react';
import {
  Table,
  Dialog,
  Row,
  Tag,
  Link,
  Form,
  Input,
  Image,
  Button,
  SelectInput,
  Checkbox,
  MessagePlugin,
  Switch,
  DatePicker,
} from 'tdesign-react';
import dayjs from 'dayjs';
import { FormInstanceFunctions } from 'tdesign-react/es/form/type';
import { SecuredIcon, ImageErrorIcon } from 'tdesign-icons-react';
import { useAppDispatch, useAppSelector } from 'modules/store';
import SearchForm from './components/SearchForm';

import classnames from 'classnames';
import CommonStyle from '../../../styles/common.module.less';
import { create, deleteByIds, find, refreshCaptcha, reset, selectSystemUser, update } from 'modules/system/user';
import { find as findRole } from 'modules/system/role';
import { find as findAction } from 'modules/system/action';
import { BOOL, PAGE } from '../../../constants';
import Permission from 'components/Permission';

const { FormItem } = Form;

interface IProps {
  edit?: boolean;
  delete?: boolean;
  lock?: boolean;
  unlock?: boolean;
  row?: any;
}

export const SelectTable = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectSystemUser);
  const { page, list, captcha } = state;
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  const [lockDialogVisible, setLockDialogVisible] = useState(false);
  const [lockDialogHeader, setLockDialogHeader] = useState('');
  const [lockDialogRow, setLockDialogRow] = useState<any>({});
  const [lockDialogForever, setLockDialogForever] = useState(false);
  const [unlockDialogVisible, setUnlockDialogVisible] = useState(false);
  const [unlockDialogHeader, setUnlockDialogHeader] = useState('');
  const [unlockDialogRow, setUnlockDialogRow] = useState<any>({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteDialogHeader, setDeleteDialogHeader] = useState('');
  const [deleteDialogRow, setDeleteDialogRow] = useState<any>({});
  const [editDialogType, setEditDialogType] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogRow, setEditDialogRow] = useState<any>({});
  const [refreshCaptchaCount, setRefreshCaptchaCount] = useState(0);
  const [captchaId, setCaptchaId] = useState('');
  const [roleSelectChecked, setRoleSelectChecked] = useState<any[]>([]);
  const [roleSelectOptions, setRoleSelectOptions] = useState<any[]>([]);
  const [actionSelectChecked, setActionSelectChecked] = useState<any[]>([]);
  const [actionSelectOptions, setActionSelectOptions] = useState<any[]>([]);

  const editFormRef = useRef<FormInstanceFunctions>();
  const lockFormRef = useRef<FormInstanceFunctions>();

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

  const fetchRoleData = async (params?: any) => {
    const p = {
      'page.num': PAGE.NUM,
      'page.size': PAGE.SIZE,
      ...params,
    };
    try {
      setRoleLoading(true);
      const res: any = await dispatch(findRole(p));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      const { list } = res.payload;
      const arr = [];
      for (const k in list) {
        arr.push({
          label: `${list[k].word}[${list[k].name}]`,
          value: list[k].id,
        });
      }
      setRoleSelectOptions(arr);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setRoleLoading(false);
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

  function onSelectChange(value: (string | number)[]) {
    setSelectedRowKeys(value);
  }

  async function doRefreshCaptcha() {
    try {
      const res: any = await dispatch(refreshCaptcha());
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      setCaptchaId(res.payload?.captcha?.id);
      setRefreshCaptchaCount(refreshCaptchaCount + 1);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    }
  }

  async function doSearch(params: any) {
    await fetchData(params);
  }

  async function handleCreate() {
    await doRefreshCaptcha();
    editFormRef.current?.reset();
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
    await fetchRoleData();
    await fetchActionData();
    const roles: any[] = [];
    if (row.roleId !== '0') {
      roles.push({
        id: row.role.id,
        word: row.role.word,
        name: row.role.name,
      });
    }
    const arr1: any[] = [];
    for (const k in roles) {
      const role = roles[k];
      const item = arr1.find((item: any) => item.value === role.id);
      if (!item) {
        arr1.push({
          label: `${role.word}[${role.name}]`,
          value: role.id,
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
    setRoleSelectChecked(arr1);
    setActionSelectChecked(arr2);
    setEditDialogRow(row);
    setEditDialogType(true);
    setEditDialogVisible(true);
  }

  function handleRowLock(row: any) {
    setLockDialogRow(row);
    setLockDialogHeader(`锁定"${row.username}"`);
    setLockDialogVisible(true);
  }

  function handleRowLockClose() {
    setLockDialogVisible(false);
  }

  async function handleRowLockConfirm() {
    const params = {
      id: lockDialogRow.id,
      locked: true,
      lockExpireTime: '',
    };
    if (!lockDialogForever) {
      const { expire } = lockFormRef.current?.getFieldsValue?.(['expire']) as { expire: string };
      params.lockExpireTime = expire;
      if (!params.lockExpireTime || params.lockExpireTime === '') {
        MessagePlugin.warning('请选择截止时间');
        return;
      }
    }
    try {
      setEditLoading(true);
      const res: any = await dispatch(update(params));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      MessagePlugin.success('锁定成功');
      await fetchData();
      setLockDialogVisible(false);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setEditLoading(false);
    }
  }

  function lockDialogSwitchChange(value: any) {
    setLockDialogForever(value);
  }

  function handleRowUnlock(row: any) {
    setUnlockDialogHeader(`解锁"${row.username}"?`);
    setUnlockDialogRow(row);
    setUnlockDialogVisible(true);
  }

  async function handleRowUnlockConfirm() {
    const params = {
      id: unlockDialogRow.id,
      locked: false,
    };
    try {
      setEditLoading(true);
      const res: any = await dispatch(update(params));
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      MessagePlugin.success('解锁成功');
      await fetchData();
      setUnlockDialogVisible(false);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    } finally {
      setEditLoading(false);
    }
  }

  function handleRowUnlockClose() {
    setUnlockDialogVisible(false);
  }

  function handleRowDelete(row: any) {
    setDeleteDialogHeader(`删除"${row.username}", 不可恢复?`);
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
        params.roleId = '0';
        if (roleCheckboxChecked.length > 1) {
          MessagePlugin.warning('只能选择一个角色');
          return;
        }
        if (roleCheckboxChecked.length === 1) {
          const [one] = roleCheckboxChecked;
          params.roleId = one;
        } else if (editDialogRow.roleId === '0') {
          delete params.roleId;
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
          ...fields,
          captchaId,
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

  const roleTagChange = async (currentTags: any, context: any) => {
    const { trigger, index } = context;
    if (trigger === 'clear') {
      setRoleSelectChecked([]);
      await fetchRoleData();
    }
    if (['tag-remove', 'backspace'].includes(trigger)) {
      const newValue = [...roleSelectChecked];
      newValue.splice(index, 1);
      setRoleSelectChecked(newValue);
    }
  };

  async function roleSelectChange(keyword: any) {
    if (keyword === '') {
      return;
    }
    await fetchRoleData({
      word: keyword,
    });
  }

  const roleSelectCheckedChange = (val: any, { current, type }: any) => {
    if (type === 'check') {
      const option = roleSelectOptions.find((t) => t.value === current);
      setRoleSelectChecked(roleSelectChecked.concat(option));
    } else {
      const newValue = roleSelectChecked.filter((v) => v.value !== current);
      setRoleSelectChecked(newValue);
    }
  };

  const getRoleCheckboxChecked = () => {
    const arr = [];
    const list = roleSelectChecked;
    for (let i = 0, len = list.length; i < len; i++) {
      if (list[i].value) {
        arr.push(list[i].value);
      }
    }
    return arr;
  };

  const roleCheckboxChecked = getRoleCheckboxChecked();

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
    let lock = false;
    let unlock = false;
    if (props.edit) {
      if (!props.row.locked) {
        lock = true;
        unlock = false;
      } else {
        lock = false;
        unlock = true;
      }
    }
    return (
      <>
        <Permission btn='system.user.update'>
          <EditBtn {...props} />
          <LockBtn {...props} lock={lock} />
          <UnlockBtn {...props} unlock={unlock} />
        </Permission>
        <Permission btn='system.user.delete'>
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

  function LockBtn(props: IProps) {
    const flag = props.lock;
    if (flag) {
      return (
        <Link
          className='t-button-link'
          theme='primary'
          hover='color'
          onClick={() => {
            handleRowLock(props.row);
          }}
        >
          锁定
        </Link>
      );
    }
    return <></>;
  }

  function UnlockBtn(props: IProps) {
    const flag = props.unlock;
    if (flag) {
      return (
        <Link
          className='t-button-link'
          theme='primary'
          hover='color'
          onClick={() => {
            handleRowUnlock(props.row);
          }}
        >
          解锁
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
            title: '唯一码',
            colKey: 'code',
            width: 150,
          },
          {
            title: '用户名',
            width: 150,
            ellipsis: true,
            colKey: 'username',
          },
          {
            title: '创建时间',
            width: 200,
            ellipsis: true,
            colKey: 'createdAt',
          },
          {
            title: '更新时间',
            width: 200,
            ellipsis: true,
            colKey: 'updatedAt',
          },
          {
            title: '平台',
            width: 200,
            ellipsis: true,
            colKey: 'platform',
            cell(record) {
              return (
                <Tag theme='success' variant='light'>
                  {record.row.platform}
                </Tag>
              );
            },
          },
          {
            title: '状态',
            width: 200,
            ellipsis: true,
            colKey: 'locked',
            cell(record) {
              if (!record.row.locked) {
                return (
                  <Tag theme='success' variant='light'>
                    正常
                  </Tag>
                );
              }
              return (
                <Tag theme='danger' variant='light'>
                  已锁定
                </Tag>
              );
            },
          },
          {
            title: '锁定时长',
            width: 200,
            ellipsis: true,
            colKey: 'lockMsg',
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
        header={editDialogType ? `编辑"${editDialogRow.username}"` : '新增'}
        visible={editDialogVisible}
        onClose={handleEditDialogClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleEditDialogConfirm}>
            确认
          </Button>
        }
      >
        <Form ref={editFormRef}>
          <FormItem label='用户名' name='username' initialData={editDialogRow.username}>
            <Input placeholder='请输入用户名' clearable />
          </FormItem>
          <FormItem label='密码' name='password' initialData={editDialogRow.password}>
            <Input type='password' placeholder='请输入密码' clearable />
          </FormItem>
          <FormItem label='平台' name='platform' initialData={editDialogRow.platform}>
            <Input placeholder='请输入平台' clearable />
          </FormItem>
          {editDialogType ? (
            <FormItem label='角色' name='roleId'>
              <div style={{ width: '100%', height: '100%' }}>
                <SelectInput
                  value={roleSelectChecked}
                  placeholder='请选择(输入关键词可搜索)'
                  tagInputProps={{ excessTagsDisplayType: 'break-line' }}
                  allowInput
                  multiple
                  clearable
                  loading={roleLoading}
                  onTagChange={roleTagChange}
                  onInputChange={roleSelectChange}
                  panel={
                    roleSelectOptions.length ? (
                      <Checkbox.Group
                        value={roleCheckboxChecked}
                        options={roleSelectOptions}
                        onChange={roleSelectCheckedChange}
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
          {!editDialogType ? (
            <FormItem label='验证码' name='captchaAnswer'>
              <Input prefixIcon={<SecuredIcon />} placeholder='请输入验证码' clearable />
              <span onClick={doRefreshCaptcha}>
                <Image
                  key={refreshCaptchaCount}
                  src={captcha.captcha.img}
                  style={{ width: '64px', height: '32px', background: '#eee' }}
                  loading={<ImageErrorIcon style={{ width: '100%', height: '100%', background: '#999' }} />}
                  error={<ImageErrorIcon style={{ width: '100%', height: '100%', background: '#999' }} />}
                />
              </span>
            </FormItem>
          ) : (
            <></>
          )}
        </Form>
      </Dialog>
      <Dialog
        header={lockDialogHeader}
        visible={lockDialogVisible}
        onClose={handleRowLockClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleRowLockConfirm}>
            确认
          </Button>
        }
      >
        <Form ref={lockFormRef}>
          <FormItem label='永久锁定' name='forever'>
            <Switch onChange={lockDialogSwitchChange} />
          </FormItem>
          {!lockDialogForever ? (
            <FormItem label='截止时间' name='expire'>
              <DatePicker disableDate={{ before: dayjs().format() }} enableTimePicker allowInput clearable />
            </FormItem>
          ) : (
            <></>
          )}
        </Form>
      </Dialog>
      <Dialog
        header={unlockDialogHeader}
        visible={unlockDialogVisible}
        onClose={handleRowUnlockClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleRowUnlockConfirm}>
            确认
          </Button>
        }
      />
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
