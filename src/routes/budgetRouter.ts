import { Router } from 'express';
import colors from 'colors'
import { BudgetController } from '../controllers/BudgetController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { validateBudgetExists, validateBudgetId, validateBudgetInput } from '../middleware/budget.middleware';
import { ExpensesController } from '../controllers/Expenses.Controller';
import { validateExpenseExists, validateExpenseId, validateExpenseInput } from '../middleware/expense.middleware';

const router = Router();

router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists);


router.param('expenseId', validateExpenseId);
router.param('expenseId', validateExpenseExists);


router.get('/', BudgetController.getAll);

router.post('/', 
	validateBudgetInput,
	handleInputErrors,
	BudgetController.create);
	
router.get('/:budgetId',

	(req, res, next) => {
		BudgetController.getById(req, res).catch(next);
	});

router.put('/:budgetId',

	validateBudgetInput,
	handleInputErrors,
	(req, res, next) => {
		BudgetController.updateById(req, res).catch(next);
	});


router.delete('/:budgetId', 
	(req, res, next) => {
		BudgetController.deleteById(req, res).catch(next);
	});


// Routes for Expenses
// Usando el patron ROA
router.get('/:budgetId/expenses', ExpensesController.getAll);


router.post('/:budgetId/expenses', 
	validateExpenseInput,
	ExpensesController.create);


router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById);

router.put('/:budgetId/expenses/:expenseId', 
	validateExpenseInput,
	handleInputErrors,
	ExpensesController.updateById);

router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById);





export default router;