import {
	extendType,
	objectType,
	nonNull,
	stringArg,
	intArg,
	inputObjectType,
	enumType,
	arg,
	list,
} from 'nexus';
import { Prisma } from '@prisma/client';

export const Sort = enumType({
	name: 'Sort',
	members: ['asc', 'desc'],
});

export const LinkOrderByInput = inputObjectType({
	name: 'LinkOrderByInput',
	definition(t) {
		t.field('description', { type: Sort });
		t.field('url', { type: Sort });
		t.field('createdAt', { type: Sort });
	},
});

export const Feed = objectType({
	name: 'Feed',
	definition(t) {
		t.nonNull.list.nonNull.field('links', { type: 'Link' });
		t.nonNull.int('count');
	},
});

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.string('description');
		t.nonNull.string('url');
		t.nonNull.dateTime('createdAt');
		t.field('postedBy', {
			type: 'User',
			resolve(parent, args, context) {
				return context.prisma.link
					.findUnique({
						where: {
							id: parent.id,
						},
					})
					.postedBy();
			},
		});
		t.nonNull.list.nonNull.field('voters', {
			type: 'User',
			resolve(parent, args, context) {
				return context.prisma.link
					.findUnique({
						where: {
							id: parent.id,
						},
					})
					.voters();
			},
		});
	},
});

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.field('feed', {
			type: 'Feed',
			args: {
				filter: stringArg(),
				skip: intArg(),
				take: intArg(),
				orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
			},
			async resolve(parent, args, context, info) {
				const where = args.filter
					? {
							OR: [
								{
									description: { contains: args.filter },
								},
								{
									url: { contains: args.filter },
								},
							],
					  }
					: {};

				const links = await context.prisma.link.findMany({
					where,
					skip: args?.skip as number | undefined,
					take: args?.take as number | undefined,
					orderBy: args?.orderBy as
						| Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
						| undefined,
				});

				const count = await context.prisma.link.count({ where });

				return {
					links,
					count,
				};
			},
		});
	},
});

export const LinkMutation = extendType({
	type: 'Mutation',
	definition(t) {
		t.nonNull.field('link', {
			type: 'Link',
			args: {
				description: nonNull(stringArg()),
				url: nonNull(stringArg()),
			},
			resolve(parent, args, context) {
				const { description, url } = args;
				const { userId } = context;

				if (!userId) throw new Error('Cannot post without logging in.');

				const link = context.prisma.link.create({
					data: {
						description,
						url,
						postedBy: { connect: { id: userId } },
					},
				});

				return link;
			},
		});
	},
});

export const GetLinkById = extendType({
	type: 'Query',
	definition(t) {
		t.field('linkById', {
			type: 'Link',
			args: { id: nonNull(intArg()) },
			resolve: (parent, args, context, info) => {
				const link = context.prisma.link.findFirst({
					where: {
						id: args.id,
					},
				});

				if (!link) return null;

				return link;
			},
		});
	},
});

export const UpdateLink = extendType({
	type: 'Mutation',
	definition(t) {
		t.field('updateLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
				description: nonNull(stringArg()),
				url: nonNull(stringArg()),
			},
			resolve(parent, args, context, info) {
				const { id, description, url } = args;
				const link = context.prisma.link.update({
					where: {
						id,
					},
					data: {
						description,
						url,
					},
				});

				if (!link) return null;

				return link;
			},
		});
	},
});

export const DeleteLink = extendType({
	type: 'Mutation',
	definition(t) {
		t.field('deleteLink', {
			type: 'Boolean',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context, info) {
				const link = context.prisma.link.delete({
					where: {
						id: args.id,
					},
				});

				if (!link) return false;

				return true;
			},
		});
	},
});
