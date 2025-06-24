import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import colors from 'colors';
import Budget from "../models/Budget";
import Expense from "../models/Expense";

declare global {
	namespace Express {
		interface Request {
			expense?: Expense; // Attach the budget to the request object			
		}
	}
}


export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
	await body('name').notEmpty().withMessage('Name of expense is required').run(req);
	await body('amount').isNumeric().withMessage('Expense  must be a number').notEmpty().withMessage('Expense is required').custom((value) => value > 0).withMessage('Expense must be greater than zero').run(req);

	next()
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => {
	await param('expenseId').isInt().withMessage('Expense ID must be a number').custom(value => value > 0).withMessage('Expense ID must be greater than zero').run(req);

	let errors = validationResult(req)
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() })
		return;
	}
	
	next()
}


export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log(colors.blue.bold(' -[Expense.Middleware.ts]- Request params: '), req.params);
		const { expenseId } = req.params;
		const expense = await Expense.findByPk(expenseId);
		if (!expense) {
			console.log(colors.yellow.bold(' -[Expense.Middleware.ts]- Expense not found'));
			const error = new Error('Expense not found');
			return res.status(404).json({ error: error.message });
		}
		console.log(colors.green.bold(' -[Expense.Middleware.ts]- Expense found: '), expense);
		req.expense = expense; // Attach the expense to the request object
		next();

	} catch (error) {
		console.log(colors.red.bold(' -[Expense.Middleware.ts]- Error fetching budget by ID: '), error);
		res.status(500).json({ error: 'Internal server error' });
	}
}