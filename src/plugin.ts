/**
 * SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <rpm@fthiessen.de>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import { loadConfig } from "browserslist"
import { ConcatSource } from "webpack-sources"
import * as webpack from "webpack"
import builder from "core-js-builder"

interface Options {
	/** CoreJS modules to use */
	modules?: string[]
	/** CoreJS modules to exclude */
	exclude?: string[]
	/** Overide browserslist targets */
	targets?: string | string[]
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

	constructor(options: Options = {}) {
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
									compilation.assets[file]
								)
							}
						})
					})
				}
			)
		})
	}
}
