import { extendType, objectType, nonNull, stringArg, intArg, arg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';

const links: NexusGenObjects['Link'][] = [
	{
		id: 1,
		description: 'Awesome website',
		url: 'www.google.com',
	},
	{
		id: 2,
		description: 'Learn code',
		url: 'www.learncodeonline.in',
	},
];

export const Link = objectType({
	name: 'Link',
	definition(t) {
		t.nonNull.int('id');
		t.nonNull.string('description');
		t.nonNull.string('url');
	},
});

export const LinkQuery = extendType({
	type: 'Query',
	definition(t) {
		t.nonNull.list.nonNull.field('feed', {
			type: 'Link',
			resolve(parent, args, context, info) {
				return links;
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

				const id = links.length + 1;
				const link = {
					id,
					description,
					url,
				};

				links.push(link);
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
			args: { id: intArg() },
			resolve: (parent, args, context, info) => {
				let link = links.find(({ id }) => id === args.id);

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
				let idx = null;
				links.forEach(({ id }, i) => (id === args.id ? (idx = i) : null));

				if (!idx) return null;

				const link = {
					id: args.id,
					description: args.description,
					url: args.description,
				};

				links[idx] = link;

				return link;
			},
		});
	},
});

export const DeleteLink = extendType({
	type: 'Mutation',
	definition(t) {
		t.field('deleteLink', {
			type: 'Link',
			args: {
				id: nonNull(intArg()),
			},
			resolve(parent, args, context, info) {
				let idx = null;
				links.forEach(({ id }, i) => (id === args.id ? (idx = i) : null));

				if (!idx) return null;

				const link = links[idx];

				links.splice(idx, 1);

				return link;
			},
		});
	},
});
