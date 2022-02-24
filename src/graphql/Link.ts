import { extendType, objectType, nonNull, stringArg, intArg, arg } from 'nexus';

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.string('description');
		t.nonNull.string('url');
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
	},
});

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('feed', {
			type: 'Link',
			resolve(parent, args, context, info) {
				return context.prisma.link.findMany();
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
				const link = context.prisma.link.create({
					data: args,
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
