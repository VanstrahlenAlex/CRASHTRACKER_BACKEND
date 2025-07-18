import colors from 'colors'
import { Request, Response } from 'express';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
export class BudgetController {
	static getAll = async (req : Request, res : Response) => {
		try {
			const budgets = await Budget.findAll({
				order: [['createdAt', 'DESC']],
				//TODO: Filtrar por usuario
				where: { userId: req.user.id }, // Assuming req.user contains the authenticated user
			});
			res.json(budgets);
			console.log(colors.blue.bold(' -[BudgetController.ts]- From GET BudgetController getAll'));
			
		} catch (error) {
			console.log(colors.red.bold(' -[BudgetController.ts]- Error fetching budgets: '), error);
			res.status(500).json({ error: 'Internal server error' });

		}
	}

	static create = async (req: Request, res: Response) => {
		console.log(colors.blue.bold(' -[BudgetController.ts]- From POST BudgetController create'));
		console.log(colors.blue.bold(' -[BudgetController.ts]- Request body: '), req.body);
		try {
			const budget = await Budget.create(req.body);
			budget.userId = req.user.id; // Assuming req.user contains the authenticated user
			await budget.save();
			console.log(colors.green.bold(' -[BudgetController.ts]- Budget created successfully: '), budget);
			res.status(201).json("Budget created successfully");
		} catch (error) {
			console.log(colors.red.bold(' -[BudgetController.ts]- Error creating budget: '), error);
			res.status(500).json({ error: 'Internal server error' });
			
		}
		
	}

	static getById = async (req: Request, res: Response) => {
		const budget = await Budget.findByPk(req.budget.id, {
			include: [Expense]
		})


		res.json(budget)
		
	}

	static updateById = async (req: Request, res: Response) => {
		console.log(colors.blue.bold(' -[BudgetController.ts]- From PUT BudgetController updateById'));
		await req.budget.update(req.body);
		res.json({ message: 'Budget updated successfully',  });
		console.log(colors.green.bold(' -[BudgetController.ts]- Budget updated successfully: '), req.budget);
	}

	static deleteById = async (req: Request, res: Response) => {
		console.log(colors.blue.bold(' -[BudgetController.ts]- From DELETE BudgetController getById'));

		await req.budget.destroy();
		res.status(200).json({ message: 'Budget deleted successfully' });
		console.log(colors.green.bold(' -[BudgetController.ts]- Budget deleted successfully: '), req.budget);
	}
}