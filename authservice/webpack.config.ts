import { Configuration, WebpackPluginInstance } from 'webpack';
import { resolve } from 'path';
import WebpackNodeExternals from 'webpack-node-externals';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin';

delete process.env.TS_NODE_PROJECT;

const { NODE_ENV = 'production' } = process.env;

const development = NODE_ENV === 'development';

const plugins: WebpackPluginInstance[] = [new ForkTsCheckerWebpackPlugin()];

if (development) {
    plugins.push(
        new ForkTsCheckerNotifierWebpackPlugin({
            title: 'Authorization service',
            excludeWarnings: false,
            skipSuccessful: true,
        })
    );
}

const config: Configuration = {
    entry: resolve(__dirname, 'src/app'),
    devtool: development ? 'inline-source-map' : false,
    mode: development ? 'development' : 'production',
    target: 'node',
    watch: development,
    externals: development ? WebpackNodeExternals() : undefined,
    output: {
        path: resolve(__dirname, 'build'),
        filename: 'app.js',
    },
    resolve: {
        extensions: development ? ['.ts'] : ['.ts', '.js'],
        // @ts-ignore
        plugins: [new TsconfigPathsPlugin()],
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                exclude: /node_modules/,
            },
        ],
    },
    experiments: {
        topLevelAwait: true,
    },
};

export default config;
