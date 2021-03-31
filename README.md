# Webpack Canvas Loader
Process files using the canvas api to cut, resize or apply filters on images.

## Installation
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

<br>

# Example use cases

## Computing average color
Average image color could be used as a placeholder while an image is loading:
```js
{
    resourceQuery: /average-image-rgb/,
    type: "javascript/auto",
    loader: "webpack-canvas-loader",
    options: {
        render({ image }) {
            const res = 10;
            const ctx = createCanvas(res, res).getContext("2d");
            ctx.drawImage(image, 0, 0, res, res);
            const { data } = ctx.getImageData(0, 0, size, size);
            let r = 0, g = 0, b = 0;
            const points = res * res;
            for (let i = 0; i < points; i++) {
                r += data[i * 4];
                g += data[i * 4 + 1];
                b += data[i * 4 + 2];
            }
            return JSON.stringify(`rgb(${r / points | 0}, ${g / points | 0}, ${b / points | 0})`);
        }
    }
}
```
```js
import average from "./image.jpg?average-image-rgb";

imagePlaceholder.style.backgroundColor = average;
```

## Limiting image size
In case you don't want to open up your image editing software for every new image or you want to provide individual variants for different media sizes.

In this example, the width and height is limited to a constant 1000 pixels, but you can refer to the resource query example below to make this limit configurable.
```js
{
    resourceQuery: /limit-image-size/,
    type: "javascript/auto",
    loader: "webpack-canvas-loader",
    options: {
        render({ image, emitJPEG }) {
            const naturalSize = Math.max(image.naturalWidth, image.naturalHeight);
            const size = Math.min(1000, naturalSize);
            const width = image.naturalWidth / naturalSize * size;
            const height = image.naturalHeight / naturalSize * size;
            const ctx = createCanvas(width, height).getContext("2d");
            ctx.drawImage(image, 0, 0, width, height);
            return emitJPEG(ctx.canvas, { quality: 0.9 });
        }
    }
}
```
```js
import url from "./image.jpg?limit-image-size";
```

## Resource queries
In case you want to pass arguments to your render function, you can use the resource query.
```js
const { parse } = require("querystring");

{
    resourceQuery: /image-quality=/,
    type: "javascript/auto",
    loader: "webpack-canvas-loader",
    options: {
        render({ image, emitJPEG }) {
            // Note, that "this" refers to the webpack loader context.
            const query = parse(this.resourceQuery.slice(1));
            const quality = query["image-quality"];
            if (!(quality > 0 && quality <= 1)) {
                throw new Error("Quality must be a number between 0 and 1.");
            }
            const ctx = createCanvas(image.naturalWidth, image.naturalHeight).getContext("2d");
            ctx.drawImage(image);
            return emitJPEG(ctx.canvas, { quality });
        }
    }
}
```
```js
import url from "./image.jpg?image-quality=0.5";
```
