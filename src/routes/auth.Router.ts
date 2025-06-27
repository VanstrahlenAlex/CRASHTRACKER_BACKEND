import { Router } from 'express';
import { AuthController } from '../controllers/Auth.Controller';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middleware/validation';
import { limiter } from '../config/limiter';
import { authenticate } from '../middleware/Auth.Middleware';


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

authRouter.post('/validate-token',
	body('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.validateToken(req, res);
		} catch (err) {
			next(err);
		}
	}
)


authRouter.post('/reset-password/:token',
	param('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token is required'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.resetPasswordWithToken(req, res);
		} catch (err) {
			next(err);
		}
	}
)

authRouter.get('/user',
	// Middleware to authenticate the user
	authenticate,
	AuthController.user
)

authRouter.post('/update-password',
	authenticate,
	body('current_password').notEmpty().withMessage('The current Password does not be empty'),
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.updateCurrentUserPassword(req, res);
		} catch (err) {
			next(err);
		}
	}
)

authRouter.post('/check-password',
	authenticate,
	body('password').notEmpty().withMessage('The current Password does not be empty'),
	handleInputErrors,
	async (req, res, next) => {
		try {
			await AuthController.checkPassword(req, res);
		} catch (err) {
			next(err);
		}
	}
)



export default authRouter;