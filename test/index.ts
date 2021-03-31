import test from "ava";
import path from "path";
import webpack = require("webpack");
import MemoryFS = require("memory-fs");
import { createCanvas } from "canvas";

const loader = require.resolve("../src");

test("general usage", async t => {
	const compiler = webpack({
		context: path.join(__dirname, "../.."),
		mode: "development",
		entry: "./test/entry.js",
		output: { path: "/", filename: "index.js" },
		module: {
			rules: [
				{ test: /\.(jpg|png)$/, loader, options: {
					name: "canvas.jpg",
					render({ image, emitJPEG }) {
						const width = 64;
						const height = width / image.naturalWidth * image.naturalHeight;

						const canvas = createCanvas(width, height);
						const ctx = canvas.getContext("2d");
						ctx.drawImage(image, 0, 0, width, height);

						return emitJPEG(canvas, { quality: 0.9 });
					}
				} }
			]
		}
	});

	const fs = new MemoryFS();
	compiler.outputFileSystem = fs;

	await runCompiler(compiler);

	t.deepEqual(fs.readdirSync("/"), ["canvas.jpg", "index.js"]);
});

function runCompiler(compiler: webpack.Compiler) {
	return new Promise((resolve, reject) => {
		compiler.run((error, stats) => {
			if (error) {
				reject(error);
			} else if (stats.hasErrors()) {
				reject(stats.toJson({ all: false, errors: true }).errors.join("\n"));
			} else {
				resolve(stats);
			}
		})
	});
}
