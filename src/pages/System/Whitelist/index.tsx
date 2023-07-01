import React, { useState, memo, useEffect, useRef } from 'react';
import { Table, Dialog, Row, Tag, Link, Form, Select, Button, Textarea, MessagePlugin } from 'tdesign-react';
import { FormInstanceFunctions } from 'tdesign-react/es/form/type';
import { useAppDispatch, useAppSelector } from 'modules/store';
import SearchForm from './components/SearchForm';

import classnames from 'classnames';
import CommonStyle from '../../../styles/common.module.less';
import { create, deleteByIds, find, reset, selectSystemWhitelist, update } from 'modules/system/whitelist';
import { idempotent } from '../../../modules/global/idempotent';
import Permission from 'components/Permission';
import { WHITELIST_OPTIONS } from '../../../constants';

const { FormItem } = Form;

interface IProps {
  edit?: boolean;
  delete?: boolean;
  row?: any;
}

export const SelectTable = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectSystemWhitelist);
  const { page, list } = state;
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);

  const [idempotentToken, setIdempotentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteDialogHeader, setDeleteDialogHeader] = useState('');
  const [deleteDialogRow, setDeleteDialogRow] = useState<any>({});
  const [editDialogType, setEditDialogType] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDialogRow, setEditDialogRow] = useState<any>({});

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
    setEditDialogRow(row);
    setEditDialogType(true);
    setEditDialogVisible(true);
  }

  function handleRowDelete(row: any) {
    setDeleteDialogHeader(`删除"${row.id}", 不可恢复?`);
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

  function handleEditDialogClose() {
    setEditDialogVisible(false);
  }

  function OpBtn(props: IProps) {
    return (
      <>
        <Permission btn='system.whitelist.update'>
          <EditBtn {...props} />
        </Permission>
        <Permission btn='system.whitelist.delete'>
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
            title: '分类',
            width: 150,
            colKey: 'category',
            cell(record) {
              const matched = WHITELIST_OPTIONS.find((item: any) => item.value === record.row.category);
              return (
                <Tag theme='success' variant='light'>
                  {matched ? matched.label : 'unknown'}
                </Tag>
              );
            },
          },
          {
            title: '授权资源',
            width: 300,
            colKey: 'resource',
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
        header={editDialogType ? `编辑"${editDialogRow.id}"` : '新增'}
        visible={editDialogVisible}
        onClose={handleEditDialogClose}
        confirmBtn={
          <Button loading={editLoading} onClick={handleEditDialogConfirm}>
            确认
          </Button>
        }
      >
        <Form ref={editFormRef}>
          <FormItem label='分类' name='category'>
            <Select options={WHITELIST_OPTIONS} placeholder='请选择分类' initialData={editDialogRow.category} />
          </FormItem>
          <FormItem label='授权资源' name='resource' initialData={editDialogRow.resource}>
            <Textarea placeholder='请输入内容(1行表示一个资源)' autosize={{ minRows: 10 }} />
          </FormItem>
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
