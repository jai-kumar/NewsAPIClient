module.exports = {
	cronObj: {
		start: function (cb, countryCode) {
			console.log(`cron started`);
			let count = 0;
			setInterval(() => {
				console.log(`calling cb from cron on: ${Date.now()} with country: ${countryCode}`);
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
			console.log(`cron 7 times started`);
			let count = 0;
			let intervalId = setInterval(() => {
				console.log(`calling cb from crom start7Times on: ${Date.now()} with country: ${countryCode}`);
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
			}, 1000);
		}
	}
}
