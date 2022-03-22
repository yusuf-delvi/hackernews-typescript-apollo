import { extendType, objectType, nonNull, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const APP_SECRET = process.env.APP_SECRET!;

export const AuthPayload = objectType({
	name: 'AuthPayload',
	definition(t) {
		t.nonNull.string('token');
		t.nonNull.field('user', {
			type: 'User',
		});
	},
});

export const AuthMutation = extendType({
	type: 'Mutation',

	definition(t) {
		t.nonNull.field('login', {
			type: 'AuthPayload',
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				const user = await context.prisma.user.findFirst({
					where: {
						email: args.email,
					},
				});

				if (!user) {
					throw new Error('User not found');
				}

				const authorize = await bcrypt.compare(args.password, user.password);

				if (!authorize) {
					throw new Error('Incorrect password');
				}

				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				return {
					user,
					token,
				};
			},
		});

		t.nonNull.field('signup', {
			type: 'AuthPayload',
			args: {
				name: nonNull(stringArg()),
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				const { name, email } = args;

				const password = await bcrypt.hash(args.password, 10);

				const user = await context.prisma.user.create({
					data: {
						name,
						email,
						password,
					},
				});

				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				return {
					token,
					user,
				};
			},
		});
	},
});
