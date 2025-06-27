import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const bearer = req.headers.authorization;
	if (!bearer) {
		const error = new Error("User not authorized,");
		res.status(401).json({ error: error.message });
		return;
	}

	const [, token] = bearer.split(' ');
	if (!token) {
		const error = new Error("Invalid token");
		res.status(401).json({ error: error.message });
		return;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
		if (typeof decoded === 'object' && decoded.id) {
			req.user = await User.findByPk(decoded.id, {
				attributes: ['id', 'name', 'email']
			});
			return next(); // 👍 Esto está bien
		} else {
			res.status(401).json({ error: 'Invalid token structure' });
			return;
		}
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' });
		return;
	}
};
