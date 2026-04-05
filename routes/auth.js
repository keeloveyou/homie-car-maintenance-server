const express = require('express')
const router = express.Router()

router.post('/code2Session', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: '缺少code参数' })
    }

    const appId = process.env.WECHAT_APP_ID
    const appSecret = process.env.WECHAT_APP_SECRET

    if (!appId || !appSecret) {
      console.error('服务器未配置微信App信息')
      return res.status(500).json({ error: '服务器未配置微信App信息' })
    }

    console.log('===== 微信登录 =====')
    console.log('AppID:', appId)
    console.log('Code:', code)

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

    const response = await fetch(url)
    const data = await response.json()

    console.log('微信服务器响应:', JSON.stringify(data))

    if (data.errcode) {
      console.error('微信登录失败:', data.errmsg)
      return res.status(400).json({ 
        error: data.errmsg,
        errcode: data.errcode 
      })
    }

    res.json({
      openid: data.openid,
      unionid: data.unionid,
      session_key: data.session_key
    })
  } catch (err) {
    console.error('登录错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
