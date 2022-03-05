module.exports = {
	cronObj: {
		start: function (cb, countryCode) {
			let count = 0;
			setInterval(() => {
				if (countryCode) {
					cb(count, countryCode);
				} else {
					cb(count);
				}
				count++;
				if (count > 7) {
					count = 0;
				}
			}, 900000);
		},
		start7Times: function (cb, countryCode, finalCb) {
			let count = 0;
			let intervalId = setInterval(() => {
				if (countryCode) {
					cb(count, countryCode);
				} else {
					cb(count);
				}
				count++;
				if (count > 7) {
					count = 0;
					finalCb();
					clearInterval(intervalId);
				}
			}, 5000);
		}
	}
}
