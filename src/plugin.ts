/**
 * SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <rpm@fthiessen.de>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { loadConfig } from "browserslist"
import { ConcatSource } from "webpack-sources"
import builder from "core-js-builder"

import type * as webpack from "webpack"
import type { Source } from "webpack-sources"
import type { AsyncSeriesHook } from "tapable"

type Compilation = webpack.compilation.Compilation

type Wp5Compilation = Compilation & {
	hooks: Compilation["hooks"] & {
		processAssets: AsyncSeriesHook<Record<string, Source>>
	}
	PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY: 300
}

const isWebpack5 = (compilation: Compilation): compilation is Wp5Compilation =>
	"processAssets" in compilation.hooks

interface Options {
	/** CoreJS modules to use, defaults to 'core-js/es' */
	modules?: string | readonly string[] | readonly RegExp[]
	/** CoreJS modules to exclude */
	exclude?: string | readonly string[] | readonly RegExp[]
	/** Overide browserslist targets */
	targets?:
		| string
		| readonly string[]
		| Record<string, string | readonly string[]>
	/** Add comment with used modules within bundle */
	summary?: {
		size: boolean
		modules: boolean
	}
}

const pluginName = "webpack-plugin-corejs"

const isJsFile = /\.[cm]?js(?:\?.*)?$/i

export class CoreJSPlugin {
	private readonly options: any

	constructor(options: Options = { modules: "core-js/es" }) {
		this.options = {
			modules: options.modules,
			exclude: options.exclude,
			targets: options.targets || loadConfig({}),
			summary: {
				comment: options.summary,
			},
		}
	}

	apply(compiler: webpack.Compiler): void {
		compiler.hooks.compilation.tap(pluginName, (compilation) => {
			if (isWebpack5(compilation)) {
				compilation.hooks.processAssets.tapPromise(
					{
						name: pluginName,
						stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
					},
					async (assets) => {
						const bundle = await builder(this.options)
						Object.entries(assets).forEach(([file, source]) => {
							if (isJsFile.test(file)) {
								compilation.assets[file] = new ConcatSource(
									"/* CoreJS polyfills */\n",
									bundle,
									"/* Real content */\n",
									source,
								)
							}
						})
					},
				)
			} else {
				compilation.hooks.optimizeChunkAssets.tapPromise(
					pluginName,
					async (chunks) => {
						const bundle = await builder(this.options)
						chunks.forEach((chunk) => {
							if (!chunk.canBeInitial()) return

							chunk.files.forEach((file) => {
								if (isJsFile.test(file)) {
									compilation.assets[file] = new ConcatSource(
										"/* CoreJS polyfills */\n",
										bundle,
										"/* Real content */\n",
										compilation.assets[file],
									)
								}
							})
						})
					},
				)
			}
		})
	}
}
