import colors from 'colors'
import express from 'express'
import authRouter from './routes/authRouter'
import { db } from './config/db'
import adminRouter from './routes/adminRouter'
import appointmentRouter from './routes/appointmentRouter'
import serviceRouter from './routes/serviceRouter'

async function ConnectDB() {
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.blue.bold('Conexion exitosa a la base de datos'))
    } catch (error) {
        console.log(colors.blue.bold('Fallo en la conexion a la base de datos'))
    }
}

ConnectDB()

const app = express()

app.use(express.json());

app.use('/api/admin', adminRouter )
app.use('/api/auth', authRouter)
app.use('/api/appointment', appointmentRouter)
app.use('/api/services', serviceRouter)

export default app