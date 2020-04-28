/**
 * External dependencies
 */
const { BundleAnalyzerPlugin } = require( 'webpack-bundle-analyzer' );
const IgnoreEmitPlugin = require( 'ignore-emit-webpack-plugin' );
const LiveReloadPlugin = require( 'webpack-livereload-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const path = require( 'path' );

/**
 * WordPress dependencies
 */
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const postcssConfig = require( '@wordpress/postcss-config' );

/**
 * Internal dependencies
 */
const { hasBabelConfig } = require( '../utils' );

const isProduction = process.env.NODE_ENV === 'production';
const mode = isProduction ? 'production' : 'development';

const config = {
	mode,
	entry: {
		index: path.resolve( process.cwd(), 'src', 'index.js' ),
	},
	output: {
		filename: '[name].js',
		path: path.resolve( process.cwd(), 'build' ),
	},
	resolve: {
		alias: {
			'lodash-es': 'lodash',
		},
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				styles: {
					name: 'style',
					test: /style\.(sc|sa|c)ss$/,
					chunks: 'all',
					enforce: true,
				},
				default: false,
			},
		},
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					require.resolve( 'thread-loader' ),
					{
						loader: require.resolve( 'babel-loader' ),
						options: {
							// Babel uses a directory within local node_modules
							// by default. Use the environment variable option
							// to enable more persistent caching.
							cacheDirectory:
								process.env.BABEL_CACHE_DIRECTORY || true,

							// Provide a fallback configuration if there's not
							// one explicitly available in the project.
							...( ! hasBabelConfig() && {
								babelrc: false,
								configFile: false,
								presets: [
									require.resolve(
										'@wordpress/babel-preset-default'
									),
								],
							} ),
						},
					},
				],
			},
			{
				test: /\.svg$/,
				exclude: /node_modules/,
				use: [ '@svgr/webpack', 'url-loader' ],
			},
			{
				test: /\.(sc|sa|c)ss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: require.resolve( 'css-loader' ),
						options: {
							sourceMap: ! isProduction,
						},
					},
					{
						loader: require.resolve( 'postcss-loader' ),
						options: {
							ident: 'postcss',
							plugins: postcssConfig.plugins,
						},
					},
					{
						loader: require.resolve( 'sass-loader' ),
						options: {
							sourceMap: ! isProduction,
						},
					},
				],
			},
		],
	},
	plugins: [
		// WP_BUNDLE_ANALYZER global variable enables utility that represents
		// bundle content as convenient interactive zoomable treemap.
		process.env.WP_BUNDLE_ANALYZER && new BundleAnalyzerPlugin(),
		// MiniCssExtractPlugin to extract the CSS thats gets imported into JavaScript.
		new MiniCssExtractPlugin( { esModule: false, filename: '[name].css' } ),
		// MiniCssExtractPlugin creates JavaScript assets for CSS that are
		// obsolete and should be removed.
		new IgnoreEmitPlugin( [ 'style.js' ] ),
		// WP_LIVE_RELOAD_PORT global variable changes port on which live reload
		// works when running watch mode.
		! isProduction &&
			new LiveReloadPlugin( {
				port: process.env.WP_LIVE_RELOAD_PORT || 35729,
			} ),
		new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ),
	].filter( Boolean ),
	stats: {
		children: false,
	},
};

if ( ! isProduction ) {
	// WP_DEVTOOL global variable controls how source maps are generated.
	// See: https://webpack.js.org/configuration/devtool/#devtool.
	config.devtool = process.env.WP_DEVTOOL || 'source-map';
	config.module.rules.unshift( {
		test: /\.js$/,
		use: require.resolve( 'source-map-loader' ),
		enforce: 'pre',
	} );
}

module.exports = config;
