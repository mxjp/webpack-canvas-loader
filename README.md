# Webpack Canvas Loader (wip)

[![npm](https://img.shields.io/npm/v/webpack-canvas-loader) ![npm](https://img.shields.io/npm/l/webpack-canvas-loader)](https://www.npmjs.com/package/webpack-canvas-loader)
[![Travis (.com)](https://img.shields.io/travis/com/mxjp/webpack-canvas-loader)](https://travis-ci.com/mxjp/webpack-canvas-loader)

Process files using the canvas api to cut, resize or apply filters on images.

```shell
npm i -D webpack-canvas-loader
```

## Usage
```js
const { createCanvas } = require("canvas");

// Webpack configuration:
rules: [
	{
		test: /\.(jpg|png)$/,
		loader: "webpack-canvas-loader",
		options: {
			render({ image, emitJPEG, emitPNG }) {
				// 'this' is the webpack loader context.

				const width = 300;
				const height = width / image.naturalWidth * image.naturalHeight;

				const canvas = createCanvas(width, height);
				const ctx = canvas.getContext("2d");
				ctx.drawImage(image, 0, 0, width, height);

				return emitJPEG(canvas, { quality: 0.9 });
			}
		}
	}
]
```
```js
// Importing an image:
import src from "./example.jpg";

const img = document.createElement("img");
img.src = src;
document.appendChild(img);
```
+ name `<string>` - The output asset name. Default is `"canvas.[contenthash].jpg|png"` depending on the emit function that is used.
+ render `<(context) => Promise<string>>` - A function to render the image. The context object has the following properties:
	+ image `<Image>` - The source image object.
	+ emitJPEG `<(canvas: Canvas, config: JpegConfig) => Promise<string>>` or
	+ emitPNG `<(canvas: Canvas, config: PngConfig) => Promise<string>>` - Emit a jpeg or png file. Returns a javascript expression that evaluates to the public path of the asset when bundled in webpack.

### Further reading
+ Canvas specific api and supported formats are documented [here](https://www.npmjs.com/package/canvas)
