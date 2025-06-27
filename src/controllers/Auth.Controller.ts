import { Request, Response } from 'express';
import colors from 'colors';
import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
	static createAccount = async (req : Request, res : Response) => {
		const { email, password } = req.body;
		console.log(colors.blue.bold('-[Auth.Controller.ts]- Checking if user already exists...'));
		const userExists = await User.findOne({ where: { email } });
		
		if (userExists) {
			const error = new Error('User already exists in the database');
			return res.status(409).json({ error: error.message, user: userExists });
		}
		try {
			console.log(colors.blue.bold('-[Auth.Controller.ts]- Creating account...'));
			const user =  new User(req.body);
			user.password = await hashPassword(password);
			user.token = generateToken();
			await user.save();
			await AuthEmail.sendConfirmationEmail({
				name: user.name,
				email: user.email,
				token: user.token
			})
			console.log(colors.green.bold('-[Auth.Controller.ts]- Account created successfully: '), user);
			res.status(201).json({ message: 'Account created successfully', user });
		} catch (error) {
			console.error('Error creating account:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	}


	static confirmAccount = async (req: Request, res: Response) => {
		const { token } = req.body;
		const user = await User.findOne({ where: { token } });
		if (!user) {
			const error = new Error('Invalid or expired token');
			return res.status(401).json({ error: error.message });
		}
		user.confirmed = true;
		user.token = null;
		await user.save();
		res.status(200).json({ message: 'Account confirmed successfully', user });
	}


	static login = async (req: Request, res: Response) => {
		const { email, password } = req.body;
		console.log(colors.blue.bold('-[Auth.Controller.ts]- Checking if user already exists in login ...'));
		const user = await User.findOne({ where: { email } });

		if (!user) {
			const error = new Error('User does not exist in the database');
			return res.status(404).json({ error: error.message, user: user });
		}

		if(!user.confirmed) {
			const error = new Error('the account is not confirmed, please check your email');
			return res.status(403).json({ error: error.message, user: user });
		}

		const isPasswordCorrect = await checkPassword(password, user.password);
		if (!isPasswordCorrect) {
			const error = new Error('Password is incorrect');
			return res.status(401).json({ error: error.message, user: user });
		}
		const token = generateJWT(user.id);
		res.json(token)
	}

	static forgotPassword = async (req: Request, res: Response) => {
		console.log(colors.blue.bold('-[Auth.Controller.ts]- Forgot password request received...'));
		const { email } = req.body;
		console.log(colors.blue.bold('-[Auth.Controller.ts]- Checking if user already exists in login ...'));
		const user = await User.findOne({ where: { email } });

		if (!user) {
			const error = new Error('User does not exist in the database');
			return res.status(404).json({ error: error.message, user: user });
		}
		user.token = generateToken();
		await user.save();

		await AuthEmail.sendPasswordResentToken({
			name: user.name,
			email: user.email,
			token: user.token	
		})
		res.json({ message: 'Password reset token sent to your email', user: { name: user.name, email: user.email } });

	}

	static validateToken = async (req: Request, res: Response) => {
		const { token } = req.body;
		console.log(colors.blue.bold('-[Auth.Controller.ts]- Validating token...'));
		//const user = await User.findOne({ where: { token } });
		const tokenExists = await User.findOne({ where: { token } });
		if (!tokenExists) {
			const error = new Error('Invalid or expired token');
			return res.status(401).json({ error: error.message });
		}
		res.json({ message: 'Token is valid', token: tokenExists.token, userId: tokenExists.id });
		console.log(colors.green.bold('-[Auth.Controller.ts]- Token is valid: '), tokenExists.token);
	}

	static resetPasswordWithToken = async (req: Request, res: Response) => {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({ where: { token } });
		if (!user) {
			const error = new Error('Invalid or expired token');
			return res.status(401).json({ error: error.message });
		}

		// Asign the new password and clear the token
		user.password = await hashPassword(password);
		user.token = null;
		await user.save();
		res.json({ message: 'Password reset successfully', user: { name: user.name, email: user.email } });
		console.log(colors.green.bold('-[Auth.Controller.ts]- Password reset successfully for user: '), user.name);
	}

	static user = async (req: Request, res: Response) => {
		res.json(req.user);
		
	}

	static updateCurrentUserPassword = async (req: Request, res: Response) => {
		const { current_password, password } = req.body;
		const { id } = req.user;
		const user = await User.findByPk(id);

		const isPasswordCorrect = await checkPassword(current_password, user.password);
		if (!isPasswordCorrect) {
			const error = new Error('Current password is incorrect');
			return res.status(401).json({ error: error.message });
		}

		user.password = await hashPassword(password);
		await user.save();
		
		res.json({ message: 'Password updated successfully', user: { name: user.name, email: user.email } });
		console.log(colors.green.bold('-[Auth.Controller.ts]- Password updated successfully for user: '), user.name);
	}


	static checkPassword = async (req: Request, res: Response) => {
		const { password } = req.body;
		const { id } = req.user;
		const user = await User.findByPk(id);

		const isPasswordCorrect = await checkPassword(password, user.password);
		if (!isPasswordCorrect) {
			const error = new Error('Current password is incorrect');
			return res.status(401).json({ error: error.message });
		}

		

		res.json({ message: 'Password is correct', user: { name: user.name, email: user.email } });
		console.log(colors.green.bold('-[Auth.Controller.ts]- Password updated successfully for user: '), user.name);
	}

}