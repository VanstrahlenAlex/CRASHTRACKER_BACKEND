import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import colors from 'colors';
import Budget from "../models/Budget";

declare global {
	namespace Express {
		interface Request {
			budget?: Budget; // Attach the budget to the request object			
		}
	}
}

export const validateBudgetId = async (req : Request, res: Response, next: NextFunction) => {
	await param('budgetId').isInt().withMessage('ID must be a number').custom(value => value > 0).withMessage('ID must be greater than zero').run(req);
	let errors = validationResult(req)
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() })
		return;
	}
	next()
}

export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
	try {
		console.log(colors.blue.bold(' -[budget.middleware.ts]- Request params: '), req.params);
		const { budgetId } = req.params;
		const budget = await Budget.findByPk(budgetId);
		if (!budget) {
			console.log(colors.yellow.bold(' -[budget.middleware.ts]- Budget not found'));
			const error = new Error('Budget not found');
			return res.status(404).json({ error: error.message });
		}
		console.log(colors.green.bold(' -[budget.middleware.ts]- Budget found: '), budget);
		req.budget = budget; // Attach the budget to the request object
		next();

	} catch (error) {
		console.log(colors.red.bold(' -[budget.middleware.ts]- Error fetching budget by ID: '), error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {
	await body('name').notEmpty().withMessage('Name is required').run(req);
	await body('amount').isNumeric().withMessage('Amount must be a number').notEmpty().withMessage('Amount is required').custom((value) => value > 0).withMessage('Amount must be greater than zero').run(req);


	// let errors = validationResult(req)
	// if (!errors.isEmpty()) {
	// 	res.status(400).json({ errors: errors.array() })
	// 	return;
	// }
	next()
}

