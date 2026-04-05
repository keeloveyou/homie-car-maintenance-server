require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRouter = require('./routes/auth')
const vehiclesRouter = require('./routes/vehicles')
const maintenanceRouter = require('./routes/maintenance')
const fuelExpensesRouter = require('./routes/fuel-expenses')
const maintenanceExpensesRouter = require('./routes/maintenance-expenses')
const remindersRouter = require('./routes/reminders')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/maintenances', maintenanceRouter)
app.use('/api/fuel-expenses', fuelExpensesRouter)
app.use('/api/maintenance-expenses', maintenanceExpensesRouter)
app.use('/api/reminders', remindersRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
