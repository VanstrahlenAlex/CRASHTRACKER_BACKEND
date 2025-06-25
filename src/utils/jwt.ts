import jwt from 'jsonwebtoken';

export const generateJWT = (id: string) : string => {
	console.log('-[jwt.ts]- Generating JWT token...', id);
	const token = jwt.sign({id}, process.env.JWT_SECRET, {
		expiresIn: '30d'
	})
	return token;
}