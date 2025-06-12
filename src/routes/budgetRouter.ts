import { Router } from 'express';
import colors from 'colors'
import { BudgetController } from '../controllers/BudgetController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { validateBudgetExists, validateBudgetId, validateBudgetInput } from '../middleware/budget.middleware';

const router = Router();

router.param('budgetId', validateBudgetId);
router.param('budgetId', validateBudgetExists);


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



export default router;