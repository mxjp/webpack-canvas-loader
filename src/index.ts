import { getOptions, interpolateName } from "loader-utils";
import { loadImage, Canvas, JpegConfig, PngConfig } from "canvas";

function renderToJPEG(canvas: Canvas, config?: JpegConfig) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		canvas.createJPEGStream(config)
			.on("data", chunk => chunks.push(chunk))
			.on("error", reject)
			.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

function renderToPNG(canvas: Canvas, config?: PngConfig) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		canvas.createPNGStream(config)
			.on("data", chunk => chunks.push(chunk))
			.on("error", reject)
			.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

function loader(source: Buffer) {
	const options = getOptions(this);
	const cb = this.async();
	(async () => {
		const image = await loadImage(source);
		return `export default ${await options.render.call(this, {
			image,
			emitJPEG: async (canvas: Canvas, config?: JpegConfig) => {
				const content = await renderToJPEG(canvas, config);
				const name = interpolateName(this, options.name || "canvas.[contenthash].jpg", { content });
				this.emitFile(name, content);
				return `(__webpack_public_path__+${JSON.stringify(name)})`;
			},
			emitPNG: async (canvas: Canvas, config?: PngConfig) => {
				const content = await renderToPNG(canvas, config);
				const name = interpolateName(this, options.name || "canvas.[contenthash].png", { content });
				this.emitFile(name, content);
				return `(__webpack_public_path__+${JSON.stringify(name)})`;
			}
		})}`;
	})().then(result => cb(null, result), cb);
}

loader.raw = true;

module.exports = loader;
