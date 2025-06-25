import { Router } from 'express';
import { AuthController } from '../controllers/Auth.Controller';
import { body } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { limiter } from '../config/limiter';


const authRouter = Router();

authRouter.use(limiter)

authRouter.post('/create-account', 
	body('name').notEmpty().withMessage('Name is required'),
	body('email').isEmail().withMessage('Invalid email format'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.createAccount(req, res);
		} catch (err) {
			next(err);
		}
	});

authRouter.post('/confirm-account',

	body('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.confirmAccount(req, res);
		} catch (err) {
			next(err);
		}
	}
)	


authRouter.post('/login',
	body('email').isEmail().withMessage('Invalid email format'),
	body('password').notEmpty().withMessage('Password is required'),
	handleInputErrors,
	limiter, 
	async (req, res, next) => {
		try {
			await AuthController.login(req, res);
		} catch (err) {
			next(err);
		}
	}
)

authRouter.post('/forgot-password',
	body('email').isEmail().withMessage('Invalid email format'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.forgotPassword(req, res);
		} catch (err) {
			next(err);
		}
	}
)


export default authRouter;