import { extendType, objectType } from 'nexus';
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
