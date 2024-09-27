export default {
  mock: {
    // 本地mock数据
    API: '',
  },
  development: {
    // 开发环境接口请求
    API: 'http://127.0.0.1:6061',
  },
  test: {
    // 测试环境接口地址
    API: '',
  },
  release: {
    // 正式环境接口地址
    API: 'https://app.go-cinch.top',
  },
  site: {
    // TDesign部署特殊需要 与release功能一致
    API: '',
  },
};
