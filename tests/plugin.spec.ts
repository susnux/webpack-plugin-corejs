/**
 * SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <rpm@fthiessen.de>
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import type { Configuration } from "webpack"
import type { Configuration as WP5Configuration } from "webpack5"

import webpack from "webpack"
import webpack5 from "webpack5"

import { build } from "webpack-test-utils"
import { CoreJSPlugin } from "./../src"

describe("build", () => {
	const configure = (config: Configuration | WP5Configuration) => {
		config.plugins = [new CoreJSPlugin()]
	}

	;[4, 5].forEach((version) => {
		test(`with wp${version}`, async () => {
			// Create in-memory file-system
			const volume = {
				"/src/index.js": 'export default "12345"',
			}

			// Run Webpack build
			const built = await build(
				volume,
				configure,
				version === 4 ? webpack : webpack5
			)

			// Verify successful build
			expect(built.stats.hasWarnings()).toBe(false)
			expect(built.stats.hasErrors()).toBe(false)

			// Result must contain the CoreJS polyfills
			expect(
				built.fs.readFileSync("/dist/index.js").toString()
			).toContain("/* CoreJS polyfills */\n")

			// Run the code to verify result
			expect(built.require("/dist/index.js")).toBe("12345")
		})
	})
})

test("only add polyfills to initial chunks", async () => {
	const configure = (config: Configuration | WP5Configuration) => {
		config.plugins = [new CoreJSPlugin()]
		config.entry = {
			index: "/src/index.js",
		}
	}

	// Create in-memory file-system
	const volume = {
		"/src/foo.js": "export default '12345'",
		"/src/index.js":
			"const value = import('./foo.js')\nexport default value",
	}

	// Run Webpack build
	const built = await build(volume, configure, webpack)

	// Verify successful build
	expect(built.stats.hasWarnings()).toBe(false)
	expect(built.stats.hasErrors()).toBe(false)

	// Only inital chunk must contain the CoreJS polyfills
	console.log(built.fs.readdirSync("/dist"))
	expect(built.fs.readFileSync("/dist/index.js").toString()).toContain(
		"/* CoreJS polyfills */\n"
	)
	expect(
		built.fs
			.readFileSync("/dist/1.js")
			.toString()
			.indexOf("/* CoreJS polyfills */\n")
	).toBe(-1)

	// Run the code to verify result
	expect((await built.require("/dist/index.js")).default).toBe("12345")
})
