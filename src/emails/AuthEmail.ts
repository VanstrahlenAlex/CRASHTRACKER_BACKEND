import { transport } from "../config/nodemailer";

type EmailType = {
	name: string;
	email: string;
	token: string;
}

export class AuthEmail {
	static sendConfirmationEmail = async(user: EmailType) => {
		console.log(`Sending confirmation email to ${user.email}`);
		const email = await transport.sendMail({
			from: 'CrashTracker <admin@crashtrackr.com>',
			to: user.email,
			subject: 'CrashTracker Confirm your account',
			html: `
				<h1>Welcome to CrashTracker, ${user.name}!</h1>
				<p>Thank you for signing up! To complete your registration, please confirm your email address by clicking the link below:</p>
				<a href="${process.env.FRONTEND_URL}/confirm/${user.token}">Confirm your account</a>
				<p> Enter the token ${user.token} </p>
				<p>If you did not create an account, please ignore this email.</p>
				<p>Best regards,<br>The CrashTracker Team</p>
			`
		})
		console.log(`Confirmation email sent to ${user.email}:`, email.messageId);
		
	}
}