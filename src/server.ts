import express from 'express'
import colors from 'colors'
import morgan from 'morgan';
import { db } from './config/db';
import budgetRouter from './routes/budgetRouter';
import authRouter from './routes/auth.Router';

async function connectDB() {
	try {
		console.log(colors.blue.bold('-[server.ts]- Starting database connection...'));
		await db.authenticate();
		db.sync();
		console.log(colors.blue.bold('-[db.ts]- Database connected successfully'));
	} catch (error) {
		console.error(colors.red.bold(`-[db.ts]- Unable to connect to the database: ${error}`));
	}
}
connectDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())



app.use('/api/budgets', budgetRouter)
app.use('/api/auth', authRouter)





export default app