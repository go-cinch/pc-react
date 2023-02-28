import React, { useRef, memo } from 'react';
import { Row, Col, Form, Input, Button, Select } from 'tdesign-react';
import { AddIcon, DeleteIcon } from 'tdesign-icons-react';
import { FormInstanceFunctions, SubmitContext } from 'tdesign-react/es/form/type';
import { LOCKED_OPTIONS } from '../../../../constants';

const { FormItem } = Form;

export type FormValueType = {
  name?: string;
  status?: string;
  number?: string;
  time?: string;
  type?: string;
};

export type SearchFormProps = {
  onSubmit?: (values: FormValueType) => void;
  onCancel?: () => void;
  onCreate?: () => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
};

const SearchForm: React.FC<SearchFormProps> = (props) => {
  const formRef = useRef<FormInstanceFunctions>();
  const onSubmit = (e: SubmitContext) => {
    if (e.validateResult === true) {
      const params = formRef?.current?.getFieldsValue?.(true);
      if (props.onSubmit) {
        props.onSubmit({ ...params });
      }
    }
  };

  const onReset = () => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  const onCreate = () => {
    if (props.onCreate) {
      props.onCreate();
    }
  };

  const onDelete = () => {
    if (props.onDelete) {
      props.onDelete();
    }
  };

  return (
    <div className='list-common-table-query'>
      <Form ref={formRef} onSubmit={onSubmit} onReset={onReset} labelWidth={80} colon>
        <Row>
          <Col flex='1'>
            <Row gutter={[16, 16]}>
              <Col span={4} xs={12} sm={6} xl={3}>
                <FormItem label='唯一码' name='code'>
                  <Input placeholder='请输入唯一码' clearable />
                </FormItem>
              </Col>
              <Col span={4} xs={12} sm={6} xl={3}>
                <FormItem label='用户名' name='username'>
                  <Input placeholder='请输入用户名' clearable />
                </FormItem>
              </Col>
              <Col span={4} xs={12} sm={6} xl={3}>
                <FormItem label='平台' name='platform'>
                  <Input placeholder='请输入平台' clearable />
                </FormItem>
              </Col>
              <Col span={4} xs={12} sm={6} xl={3}>
                <FormItem label='状态' name='locked'>
                  <Select options={LOCKED_OPTIONS} placeholder='请选择状态' />
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col>
            <Button theme='primary' type='submit' style={{ marginLeft: '10px' }}>
              查询
            </Button>
            <Button type='reset' variant='base' theme='default' style={{ marginLeft: '8px' }}>
              重置
            </Button>
            <Button theme='primary' onClick={onCreate} icon={<AddIcon />} style={{ marginLeft: '8px' }}>
              新建
            </Button>
            <Button
              theme='danger'
              loading={props.deleteLoading}
              onClick={onDelete}
              icon={<DeleteIcon />}
              style={{ marginLeft: '8px' }}
            >
              删除
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default memo(SearchForm);
