const express = require('express')
const router = express.Router()
const supabase = require('../supabase.js')
const { getOpenId } = require('./middleware.js')

router.get('/', async (req, res) => {
  try {
    const openid = getOpenId(req)
    console.log('===== 驾照信息查询 =====')
    console.log('OpenID:', openid)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data, error } = await supabase
      .from('driver_licenses')
      .select('*')
      .eq('openid', openid)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log('查询结果数量:', data.length)
    res.json({ data })
  } catch (err) {
    console.error('查询错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const openid = getOpenId(req)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: license, error } = await supabase
      .from('driver_licenses')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error

    if (license.openid !== openid) {
      return res.status(403).json({ error: '无权限访问' })
    }

    res.json({ data: license })
  } catch (err) {
    console.error('查询错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const openid = getOpenId(req)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data, error } = await supabase
      .from('driver_licenses')
      .insert([{ ...req.body, openid }])
      .select()
      .single()
    
    if (error) throw error
    
    console.log('添加成功, ID:', data.id)
    res.json({ data })
  } catch (err) {
    console.error('添加错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const openid = getOpenId(req)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: license, error: findError } = await supabase
      .from('driver_licenses')
      .select('openid')
      .eq('id', req.params.id)
      .single()

    if (findError) throw findError

    if (license.openid !== openid) {
      return res.status(403).json({ error: '无权限' })
    }

    const { data, error } = await supabase
      .from('driver_licenses')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    console.log('更新成功, ID:', data.id)
    res.json({ data })
  } catch (err) {
    console.error('更新错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const openid = getOpenId(req)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    const { data: license, error: findError } = await supabase
      .from('driver_licenses')
      .select('openid')
      .eq('id', req.params.id)
      .single()

    if (findError) throw findError

    if (license.openid !== openid) {
      return res.status(403).json({ error: '无权限' })
    }

    const { error } = await supabase
      .from('driver_licenses')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    console.log('删除成功, ID:', req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('删除错误:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
