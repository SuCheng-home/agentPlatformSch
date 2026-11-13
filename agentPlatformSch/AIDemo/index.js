var coze = new CozeWebSDK.WebChatClient({
  config: {
    type: 'bot',
    bot_id: JSON.parse(localStorage.getItem("agentIndexobj")).bot_id,
    isIframe: false,
    botInfo: {
      parameters: {
        "source": "edu",
        "userToken": JSON.parse(localStorage.getItem("agentIndexobj")).token
      },
    },
  },
  auth: {
    type: 'token',
    token: JSON.parse(localStorage.getItem("agentIndexobj")).newtoken,
    onRefreshToken: async () => JSON.parse(localStorage.getItem("agentIndexobj")).newtoken
  },
  userInfo: { // 用户信息（对话框中显示）
    id: JSON.parse(localStorage.getItem("agentIndexobj")).userInfo.id + '', // 用户业务 ID
    url: JSON.parse(localStorage.getItem("agentIndexobj")).userInfo.avatar, // 用户头像 URL（需公开可访问）
    nickname: JSON.parse(localStorage.getItem("agentIndexobj")).userInfo.name // 用户昵称
  },
  ui: {
    base: {
      icon: JSON.parse(localStorage.getItem("agentIndexobj")).icon,
      layout: 'mobile',
      lang: 'en'
    },
    header: {
      isShow: true,
      isNeedClose: false,
    },
    asstBtn: {
      isNeed: false
    },
    footer: {
      isShow: true,
      expressionText: '所有内容均由AI生成仅供参考' // 底部文案
    },
    conversations: {
      isNeed: true,
    },
    chatBot: {
      title: JSON.parse(localStorage.getItem("agentIndexobj")).name,
      uploadable: true, // 禁用文件上传
      width: 1200,
      feedback: {
        isNeedFeedback: true,  // 是否启用反馈功能
        feedbackPanel: {       // 反馈面板详细配置
          title: '您对这个回答有什么看法？请告诉我们',
          placeholder: '请详细描述您的问题...',
          tags: [             // 反馈标签选项
            {
                label: '内容不够详细'
            },
            {
                label: '内容错误'
            },
            {
                label: '其他',
                isNeedDetail: true  // 选择此标签时需要填写详细说明
            }
          ]
        }
      }
    },
  },
});
coze.showChatBot()