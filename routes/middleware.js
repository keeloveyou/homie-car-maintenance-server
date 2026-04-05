const getOpenId = (req) => {
  return req.headers['x-openid']
}

const requireAuth = (req, res, next) => {
  const openid = getOpenId(req)
  if (!openid) {
    return res.status(401).json({ error: '未授权' })
  }
  next()
}

module.exports = { getOpenId, requireAuth }
