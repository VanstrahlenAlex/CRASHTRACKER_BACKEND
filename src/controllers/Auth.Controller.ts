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
		res.json({ message: 'Forgot password endpoint not implemented yet' });
	}
}