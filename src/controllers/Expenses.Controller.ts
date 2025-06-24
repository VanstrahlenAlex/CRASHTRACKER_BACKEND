import type { Request, Response } from 'express'
import colors from 'colors';
import Expense from '../models/Expense';
export class ExpensesController {
	static getAll = async (req: Request, res: Response) => {

	}

	static create = async (req: Request, res: Response) => {
		console.log('Creating expense...');
		try {
			const expense = new Expense(req.body);
			expense.budgetId = req.budget.id;
			await expense.save();
			console.log(colors.green.bold(' -[ExpensesController.create]- Expense created successfully: '), expense);
			res.status(201).json("Expense added successfully: " + expense);
		} catch (error) {
			res.status(500).json({ error: 'Internal server error' });
			console.error(colors.red.bold(' -[ExpensesController.create]- Error creating expense: '), error);
			return;
		}
	}

	static getById = async (req: Request, res: Response) => {
		res.json(req.expense);
	}

	static updateById = async (req: Request, res: Response) => {
		await req.expense.update(req.body)
		res.json({ message: 'Expense updated successfully', expense: req.expense });
		console.log(colors.green.bold(' -[ExpensesController.updateById]- Expense updated successfully: '), req.expense);
	}

	static deleteById = async (req: Request, res: Response) => {
		await req.expense.destroy();
		res.status(200).json({ message: 'Expense deleted successfully' });
		console.log(colors.green.bold(' -[ExpensesController.deleteById]- Expense deleted successfully: '), req.expense);
	}
}