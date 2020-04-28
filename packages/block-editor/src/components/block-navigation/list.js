/**
 * External dependencies
 */
import { isNil, map, omitBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { Slot, Fill } from "@wordpress/components";
import { Children, cloneElement } from "@wordpress/element";

/**
 * Internal dependencies
 */
import ListItem from './list-item';
import ButtonBlockAppender from '../button-block-appender';

const listItemSlotName = ( blockId ) => `BlockNavigationList-item-${ blockId }`;

export const ListItemSlot = ( { blockId, ...props } ) => <Slot { ...props } name={ listItemSlotName( blockId ) }/>;
export const ListItemFill = ( { blockId, ...props } ) => <Fill { ...props } name={ listItemSlotName( blockId ) }/>;

export default function BlockNavigationList( {
	blocks,
	selectedBlockClientId,
	onItemClick,
	showAppender,

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
				const itemProps = {
					block,
					isSelected,
					onClick: () => onItemClick( block.clientId )
				};
				return (
					<li key={ block.clientId }>
						<ListItemSlot blockId={ block.clientId }>
							{ ( fills ) => fills.length
								? Children.map( fills, fill => cloneElement( fill, itemProps ) )
								: ( <ListItem { ...itemProps } key="item1" /> ) }
						</ListItemSlot>

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
	onItemClick: () => {}
};
