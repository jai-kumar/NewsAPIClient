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
		start7Times: function (cbToUpdateFiles, countryCode, finalCbToReadAndReturn) {
			console.log(`cron 7 times started`);
			let count = 0;
			let intervalId = setInterval(() => {
				console.log(`calling cbToUpdateFiles from crom start7Times on: ${Date.now()} with country: ${countryCode}`);
				if (countryCode) {
					cbToUpdateFiles(count, countryCode);
				} else {
					cbToUpdateFiles(count);
				}
				count++;
				if (count > 7) {
					count = 0;
					finalCbToReadAndReturn();
					clearInterval(intervalId);
				}
			}, 1000);
		},
		startPushNotifications: function (cb, countryCode) {
			console.log(`cron startPushNotifications started`);
			setInterval(() => {
				console.log('Executing send notification flow...');
				cb && cb(countryCode);
			}, 4000000);//4000000 //every 66.67 min send 1 notification
		},
	}
}
