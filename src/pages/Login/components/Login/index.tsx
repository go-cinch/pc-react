import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, MessagePlugin, Input, Image, Button, FormInstanceFunctions, SubmitContext } from 'tdesign-react';
import {
  LockOnIcon,
  UserIcon,
  BrowseOffIcon,
  BrowseIcon,
  RefreshIcon,
  SecuredIcon,
  ImageErrorIcon,
} from 'tdesign-icons-react';
import classnames from 'classnames';
import QRCode from 'qrcode.react';
import { useAppDispatch } from 'modules/store';
import { login, status } from 'modules/user';
import useCountdown from '../../hooks/useCountDown';

import Style from './index.module.less';
import { refreshCaptcha } from '../../../../modules/system/user';

const { FormItem } = Form;

export type ELoginType = 'password' | 'phone' | 'qrcode';

export default function Login() {
  const [loginType, changeLoginType] = useState<ELoginType>('password');
  const [showPsw, toggleShowPsw] = useState(false);
  const [disableLogin, toggleDisableLogin] = useState(false);
  const [showCaptcha, toggleShowCaptcha] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImg, setCaptchaImg] = useState('');
  const [refreshCaptchaCount, setRefreshCaptchaCount] = useState(0);
  const { countdown, setupCountdown } = useCountdown(60);
  const formRef = useRef<FormInstanceFunctions>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onSubmit = async (e: SubmitContext) => {
    if (e.validateResult === true) {
      try {
        const formValue = formRef.current?.getFieldsValue?.(true) || {};
        const res: any = await dispatch(
          login({
            ...formValue,
            captchaId,
          }),
        );
        if (res.error?.message) {
          throw new Error(res.error?.message);
        }

        MessagePlugin.success('登录成功');

        navigate('/');
      } catch (e: any) {
        MessagePlugin.error(e.message);
        await getUserStatus();
      } finally {
      }
    }
  };

  const getUserStatus = async () => {
    try {
      const formValue = formRef.current?.getFieldsValue?.(true) || {};
      const res: any = await dispatch(status({ username: formValue.username }));
      if (res.error?.message) {
        return;
      }
      const data = res.payload;
      if (data.captcha) {
        if (data.captcha.id !== '') {
          toggleShowCaptcha(true);
        } else {
          toggleShowCaptcha(false);
        }
        setCaptchaId(data.captcha.id);
        setCaptchaImg(data.captcha.img);
      } else {
        toggleShowCaptcha(false);
      }
      if (data.locked) {
        toggleDisableLogin(true);
      } else {
        toggleDisableLogin(false);
      }
    } finally {
    }
  };

  async function doRefreshCaptcha() {
    try {
      const res: any = await dispatch(refreshCaptcha());
      if (res.error?.message) {
        throw new Error(res.error?.message);
      }
      setCaptchaId(res.payload?.captcha?.id);
      setCaptchaImg(res.payload?.captcha?.img);
      setRefreshCaptchaCount(refreshCaptchaCount + 1);
    } catch (e: any) {
      MessagePlugin.error(e.message);
    }
  }

  // const switchType = (val: ELoginType) => {
  //   formRef.current?.reset?.();
  //   changeLoginType(val);
  // };

  return (
    <div>
      <Form
        ref={formRef}
        className={classnames(Style.itemContainer, `login-${loginType}`)}
        labelWidth={0}
        onSubmit={onSubmit}
      >
        {loginType === 'password' && (
          <>
            <FormItem
              name='username'
              initialData='super'
              rules={[{ required: true, message: '账号必填', type: 'error' }]}
            >
              <Input size='large' placeholder='请输入用户名' onBlur={getUserStatus} prefixIcon={<UserIcon />} />
            </FormItem>
            <FormItem
              name='password'
              initialData='cinch123'
              rules={[{ required: true, message: '密码必填', type: 'error' }]}
            >
              <Input
                size='large'
                type={showPsw ? 'text' : 'password'}
                clearable
                placeholder='请输入密码'
                prefixIcon={<LockOnIcon />}
                suffixIcon={
                  showPsw ? (
                    <BrowseIcon onClick={() => toggleShowPsw((current) => !current)} />
                  ) : (
                    <BrowseOffIcon onClick={() => toggleShowPsw((current) => !current)} />
                  )
                }
              />
            </FormItem>
            {showCaptcha && !disableLogin && (
              <FormItem name='captchaAnswer'>
                <Input prefixIcon={<SecuredIcon />} placeholder='请输入验证码' clearable />
                <span onClick={doRefreshCaptcha}>
                  <Image
                    key={refreshCaptchaCount}
                    src={captchaImg}
                    style={{ width: '64px', height: '32px', background: '#eee' }}
                    loading={<ImageErrorIcon style={{ width: '100%', height: '100%', background: '#999' }} />}
                    error={<ImageErrorIcon style={{ width: '100%', height: '100%', background: '#999' }} />}
                  />
                </span>
              </FormItem>
            )}
          </>
        )}

        {/* 扫码登陆 */}
        {loginType === 'qrcode' && (
          <>
            <div className={Style.tipContainer}>
              <span className='tip'>请使用微信扫一扫登录</span>
              <span className='refresh'>
                刷新 <RefreshIcon />
              </span>
            </div>
            <QRCode value='' size={200} />
          </>
        )}
        {/* // 手机号登陆 */}
        {loginType === 'phone' && (
          <>
            <FormItem name='phone' rules={[{ required: true, message: '手机号必填', type: 'error' }]}>
              <Input maxlength={11} size='large' placeholder='请输入您的手机号' prefixIcon={<UserIcon />} />
            </FormItem>
            <FormItem name='verifyCode' rules={[{ required: true, message: '验证码必填', type: 'error' }]}>
              <Input size='large' placeholder='请输入验证码' />
              <Button
                variant='outline'
                className={Style.verificationBtn}
                disabled={countdown > 0}
                onClick={setupCountdown}
              >
                {countdown === 0 ? '发送验证码' : `${countdown}秒后可重发`}
              </Button>
            </FormItem>
          </>
        )}
        {loginType !== 'qrcode' && !disableLogin && (
          <FormItem className={Style.btnContainer}>
            <Button block size='large' type='submit'>
              登录
            </Button>
          </FormItem>
        )}
        {loginType !== 'qrcode' && disableLogin && (
          <FormItem className={Style.btnContainer}>
            <Button block size='large' type='submit' theme='default' disabled>
              账户已锁定, 请过会儿再试
            </Button>
          </FormItem>
        )}
        {/* <div className={Style.switchContainer}> */}
        {/*   {loginType !== 'password' && ( */}
        {/*     <span className='tip' onClick={() => switchType('password')}> */}
        {/*       使用账号密码登录 */}
        {/*     </span> */}
        {/*   )} */}
        {/*   {loginType !== 'qrcode' && ( */}
        {/*     <span className='tip' onClick={() => switchType('qrcode')}> */}
        {/*       使用微信扫码登录 */}
        {/*     </span> */}
        {/*   )} */}
        {/*   {loginType !== 'phone' && ( */}
        {/*     <span className='tip' onClick={() => switchType('phone')}> */}
        {/*       使用手机号登录 */}
        {/*     </span> */}
        {/*   )} */}
        {/* </div> */}
      </Form>
    </div>
  );
}
