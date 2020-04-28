'use strict';

/*
 * Internal dependencies
 */
const { REPO } = require( './config' );
const { getGraphqlClient } = require( './get-entry' );

const getMilestoneNumber = async ( token, milestone ) => {
	const [ owner, repo ] = REPO.split( '/' );
	const query = `
	{
		repository(owner: "${ owner }", name: "${ repo }") {
			milestones(last: 50) {
				nodes {
					title
					number
				}
			}
		}
	}
	`;
	const client = getGraphqlClient( token );
	const data = await client( query );
	const matchingNode = data.repository.milestones.nodes.find(
		( node ) => node.title === milestone
	);
	if ( ! matchingNode ) {
		throw new Error(
			`Unable to find a milestone matching the given milestone ${ milestone }`
		);
	}
	return matchingNode.number;
};

const getQuery = ( milestoneNumber, before ) => {
	const [ owner, repo ] = REPO.split( '/' );
	const paging = before ? `, before: "${ before }"` : '';
	return `
	{
		repository(owner: "${ owner }", name: "${ repo }") {
			milestone(number: ${ milestoneNumber }) {
				pullRequests(last: 100, states: [MERGED]${ paging }) {
					totalCount
					pageInfo {
						hasPreviousPage
						startCursor
					}
					nodes {
						number
						title
						url
						author {
							login
						}
						body
						labels(last: 10) {
							nodes {
								name
							}
						}
					}
				}
			}
		}
	}
	`;
};

const fetchAllPullRequests = async ( token, milestone ) =>
	await ( async () => {
		const client = getGraphqlClient( token );
		const milestoneNumber = await getMilestoneNumber( token, milestone );
		const fetchResults = async ( before ) => {
			const query = getQuery( milestoneNumber, before );
			const results = await client( query );
			if (
				results.repository.milestone.pullRequests.pageInfo
					.hasPreviousPage === false
			) {
				return results.repository.milestone.pullRequests.nodes;
			}

			const nextResults = await fetchResults(
				results.repository.milestone.pullRequests.pageInfo.startCursor
			);
			return results.repository.milestone.pullRequests.nodes.concat(
				nextResults
			);
		};
		return await fetchResults();
	} )();

module.exports = {
	fetchAllPullRequests,
};
