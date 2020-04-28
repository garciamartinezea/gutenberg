/**
 * External dependencies
 */
import { isNil, map, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import BlockNavigationListItem from './list-item';
import ButtonBlockAppender from '../button-block-appender';

export default function BlockNavigationList( {
	blocks,
	selectedBlockClientId,
	onItemClick,
	showAppender,
	listItemComponent: ListItemComponent,

	// Internal use only.
	showNestedBlocks,
	parentBlockClientId,
} ) {
	const shouldShowAppender = showAppender && !! parentBlockClientId;

	return (
		/*
		 * Disable reason: The `list` ARIA role is redundant but
		 * Safari+VoiceOver won't announce the list otherwise.
		 */
		/* eslint-disable jsx-a11y/no-redundant-roles */
		<ul className="block-editor-block-navigation__list" role="list">
			{ map( omitBy( blocks, isNil ), ( block ) => {
				const isSelected = block.clientId === selectedBlockClientId;
				return (
					<li key={ block.clientId }>
						<ListItemComponent
							block={ block }
							isSelected={ isSelected }
							onClick={ () => onItemClick( block.clientId ) }
						/>
						{ showNestedBlocks &&
							!! block.innerBlocks &&
							!! block.innerBlocks.length && (
								<BlockNavigationList
									blocks={ block.innerBlocks }
									selectedBlockClientId={
										selectedBlockClientId
									}
									onItemClick={ onItemClick }
									parentBlockClientId={ block.clientId }
									listItemComponent={ ListItemComponent }
									showAppender={ showAppender }
									showNestedBlocks
								/>
							) }
					</li>
				);
			} ) }
			{ shouldShowAppender && (
				<li>
					<div className="block-editor-block-navigation__item">
						<ButtonBlockAppender
							rootClientId={ parentBlockClientId }
							__experimentalSelectBlockOnInsert={ false }
						/>
					</div>
				</li>
			) }
		</ul>
		/* eslint-enable jsx-a11y/no-redundant-roles */
	);
}

BlockNavigationList.defaultProps = {
	onItemClick: () => {},
	listItemComponent: BlockNavigationListItem,
};
