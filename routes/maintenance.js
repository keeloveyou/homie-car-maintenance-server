const express = require('express')
const router = express.Router()
const supabase = require('../supabase.js')
const { getOpenId } = require('./middleware.js')

router.get('/', async (req, res) => {
  try {
    const openid = getOpenId(req)
    console.log('===== 保养列表查询 =====')
    console.log('OpenID:', openid)
    
    if (!openid) {
      return res.status(401).json({ error: '未授权' })
    }

    let query = supabase
      .from('maintenance')
      .select('*')

    if (req.query.vehicleId) {
      query = query.eq('vehicle_id', req.query.vehicleId)
    }
    
    const { data: maintenanceData, error: maintenanceError } = await query
    
    if (maintenanceError) throw maintenanceError

    if (maintenanceData && maintenanceData.length > 0) {
      const vehicleIds = [...new Set(maintenanceData.map(m => m.vehicle_id))]
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('openid', openid)
        .in('id', vehicleIds)

      if (vehiclesError) throw vehiclesError

      const allowedVehicleIds = vehicles.map(v => v.id)
      const filteredData = maintenanceData.filter(m => allowedVehicleIds.includes(m.vehicle_id))
      
      console.log('查询结果数量:', filteredData.length)
      res.json({ data: filteredData })
    } else {
      console.log('查询结果数量: 0')
      res.json({ data: [] })
    }
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

    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (maintenanceError) throw maintenanceError

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('openid')
      .eq('id', maintenance.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return res.status(403).json({ error: '无权限访问' })
    }

    if (vehicle.openid !== openid) {
      return res.status(403).json({ error: '无权限访问' })
    }

    res.json({ data: maintenance })
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

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('openid')
      .eq('id', req.body.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return res.status(400).json({ error: '车辆不存在' })
    }

    if (vehicle.openid !== openid) {
      return res.status(403).json({ error: '无权限' })
    }

    const { data, error } = await supabase
      .from('maintenance')
      .insert([req.body])
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

    const { data: maintenance, error: findError } = await supabase
      .from('maintenance')
      .select('vehicle_id')
      .eq('id', req.params.id)
      .single()

    if (findError) throw findError

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('openid')
      .eq('id', maintenance.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return res.status(403).json({ error: '无权限' })
    }

    if (vehicle.openid !== openid) {
      return res.status(403).json({ error: '无权限' })
    }

    const { data, error } = await supabase
      .from('maintenance')
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

    const { data: maintenance, error: findError } = await supabase
      .from('maintenance')
      .select('vehicle_id')
      .eq('id', req.params.id)
      .single()

    if (findError) throw findError

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('openid')
      .eq('id', maintenance.vehicle_id)
      .single()

    if (vehicleError || !vehicle) {
      return res.status(403).json({ error: '无权限' })
    }

    if (vehicle.openid !== openid) {
      return res.status(403).json({ error: '无权限' })
    }

    const { error } = await supabase
      .from('maintenance')
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
