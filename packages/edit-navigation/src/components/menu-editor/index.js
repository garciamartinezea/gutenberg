/**
 * WordPress dependencies
 */
import {
	__experimentalBlockNavigationListItem,
	BlockEditorKeyboardShortcuts,
	BlockEditorProvider,
	RichText,
} from '@wordpress/block-editor';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useNavigationBlocks from './use-navigation-blocks';
import MenuEditorShortcuts from './shortcuts';
import BlockEditorPanel from './block-editor-panel';
import NavigationStructurePanel from './navigation-structure-panel';

export default function MenuEditor( { menuId, blockEditorSettings } ) {
	const [ blocks, setBlocks, saveBlocks ] = useNavigationBlocks( menuId );
	const isLargeViewport = useViewportMatch( 'medium' );

	return (
		<div className="edit-navigation-menu-editor">
			<BlockEditorKeyboardShortcuts.Register />
			<MenuEditorShortcuts.Register />

			<BlockEditorProvider
				value={ blocks }
				onInput={ ( updatedBlocks ) => setBlocks( updatedBlocks ) }
				onChange={ ( updatedBlocks ) => setBlocks( updatedBlocks ) }
				settings={ {
					...blockEditorSettings,
					templateLock: 'all',
					hasFixedToolbar: true,
				} }
			>
				<BlockEditorKeyboardShortcuts />
				<MenuEditorShortcuts saveBlocks={ saveBlocks } />
				<NavigationStructurePanel
					blocks={ blocks }
					initialOpen={ isLargeViewport }
					onChange={ ( updatedBlocks ) => setBlocks( updatedBlocks ) }
					listItemComponent={ EditableNavigationItem }
				/>
				<BlockEditorPanel saveBlocks={ saveBlocks } />
			</BlockEditorProvider>
		</div>
	);
}

const EditableNavigationItem = ( props ) => {
	return (
		<__experimentalBlockNavigationListItem
			{ ...props }
			wrapperComponent="div"
			labelComponent={ EditableLabel }
		/>
	);
};

const EditableLabel = ( { block, label } ) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );
	return (
		<RichText
			className="wp-block-navigation-link__label"
			value={ label }
			onChange={ ( newLabel ) =>
				updateBlockAttributes( block.clientId, { label: newLabel } )
			}
			placeholder={ __( 'Add link…' ) }
			keepPlaceholderOnFocus={ false }
			withoutInteractiveFormatting
			allowedFormats={ [
				'core/bold',
				'core/italic',
				'core/image',
				'core/strikethrough',
			] }
		/>
	);
};
