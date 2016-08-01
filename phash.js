function imagePHash(image) {
	if (image.width < 50 && image.height < 50) {
		return null;
	}

	var start = new Date().getTime();
	var result = {
		imgUrl : image.src,
		pHash : "none",
		img : image
	}

	try {
		var size1 = 32;
		var imgW = size1;
		var imgH = size1;

		image.crossOrigin = "Anonymous";

		if (!image.canvas) {
			image.canvas = $('<canvas />')[0];
			image.canvas.width = imgW;
			image.canvas.height = image.height;
			image.canvas.getContext('2d').drawImage(image, 0, 0, imgW, imgH);
		}

		var c = function(i) {
			if (i == 0) {
				return 1 / Math.sqrt(2.0);
			}
			return 1;
		}

		// FIXME alpha channel
		var imgPixels = image.canvas.getContext('2d').getImageData(0, 0, imgW, imgH);
		var dct = [];
		for (var u = 0; u < imgH; u++) {
			for (var v = 0; v < imgW; v++) {
				var pixelIndex = (u * 4) * imgW + v * 4;
				var pixelValue = (imgPixels.data[pixelIndex] + imgPixels.data[pixelIndex + 1] + imgPixels.data[pixelIndex + 2]) / 3;

				imgPixels.data[pixelIndex] = pixelValue;
				imgPixels.data[pixelIndex + 1] = pixelValue;
				imgPixels.data[pixelIndex + 2] = pixelValue;

				var sum = 0.0;
				for (var i = 0; i < size1; i++) {
					for (var j = 0; j < size1; j++) {
						var pixelIndex2 = (i * 4) * imgW + j * 4;
						var pixelValue2 = (imgPixels.data[pixelIndex2] + imgPixels.data[pixelIndex2 + 1] + imgPixels.data[pixelIndex2 + 2]) / 3;
						sum += Math.cos(((2 * i + 1) / (2.0 * size1)) * u * Math.PI) * Math.cos(((2 * j + 1) / (2.0 * size1)) * v * Math.PI) * (pixelValue2);
					}
				}
				sum *= ((c(u) * c(v)) / 4.0);
				dct.push(sum);
			}
		}

		var size2 = 8;
		var total = 0;
		for (var x = 0; x < size2; x++) {
			for (var y = 0; y < size2; y++) {
				var index = x * size2 + y;
				total += dct[index];
			}
		}

		total -= dct[0];
		var avg = total / ((size2 * size2) - 1);
		var hash = "";

		for (var x = 0; x < size2; x++) {
			for (var y = 0; y < size2; y++) {
				if (x != 0 && y != 0) {
					var index = x * size2 + y;
					dct[index] > avg ? hash = hash + "1" : hash = hash + "0";
				}
			}
		}
		
		result.pHash = hash;
	} catch (err) {
		console.log(err);
	}

	var end = new Date().getTime();
	console.log(image.src + " -> binary pHash: " + result.pHash + " ---> " + (end - start) + " ms");
	
	var intValue = parseInt(result.pHash, 2);
	
	console.log("hex pHash -> " + intValue.toString(16));


	return result;
}