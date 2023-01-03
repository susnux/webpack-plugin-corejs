/**
 * SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <rpm@fthiessen.de>
 *
 * SPDX-License-Identifier: CC0-1.0
 */

declare module "core-js-builder" {
	type Summary = {
		size: boolean
		modules: boolean
	}

	type CompatTargets = Record<string, string> & { esmodules?: boolean }

	type Options = {
		/** entry / module / namespace / an array of them, by default - all `core-js` modules */
		modules?: string[]
		/** a blacklist of entries / modules / namespaces, by default - empty list */
		exclude?: string[]
		/** optional browserslist or core-js-compat format query */
		targets?: string | string[] | CompatTargets
		/** output format, 'bundle' by default, can be 'cjs' or 'esm', and in this case
		 *  the result will not be bundled and will contain imports of required modules */
		format?: "bundle" | "esm" | "cjs"
		/** optional target filename, if it's missed a file will not be created */
		filename?: string
		/** shows summary for the bundle, disabled by default */
		summary?: {
			/** in the console, you could specify required parts or set `true` for enable all of them */
			comment?: Summary
			/**  in the comment in the target file, similarly to `summary.console` */
			console?: Summary
		}
	}

	const builder: (options: Options) => Promise<string>
	export = builder
}
