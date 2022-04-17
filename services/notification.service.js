const { Expo } = require('expo-server-sdk')
const fs = require('fs');
const path = require('path');
const util = require('util');
// Convert fs.readFile & fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo(
    // { accessToken: process.env.EXPO_ACCESS_TOKEN }
);

const startSendingNotifications = (deviceTokens, cbToRemoveTokenFromDB, data) => {
    // Create the messages that you want to send to clients
    let messages = [];

    for (let pushToken of deviceTokens) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
        pushToken = `ExponentPushToken[${pushToken.substring(0, pushToken.length-1-3)}]`

        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        // data = data[Math.floor(Math.random() * data.length)]; // get random from top 5 news
        // console.log('data: ',data);

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
            to: pushToken,
            priority: 'high',
            sound: 'default',
            title: data.title,
            body: data.title || 'This is a test notification',
            data: { urlToImage: data.urlToImage, article: data },
        })
    }

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);

                if (ticketChunk.status === 'error') {
                    if (ticketChunk.details.error === 'DeviceNotRegistered') {
                        let deviceTokenToBeRemoved = ticketChunk.message.split('[')[1].split(']')[0];
                        deviceTokenToBeRemoved = `ExponentPushToken[${deviceTokenToBeRemoved}0081]`;
                        cbToRemoveTokenFromDB(deviceTokenToBeRemoved);
                    }
                } else {
                    tickets.push(...ticketChunk);
                }

                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (errorResponse) {
                console.error(errorResponse);
            }
        }
    })();

    // Later, after the Expo push notification service has delivered the
    // notifications to Apple or Google (usually quickly, but allow the the service
    // up to 30 minutes when under load), a "receipt" for each notification is
    // created. The receipts will be available for at least a day; stale receipts
    // are deleted.
    //
    // The ID of each receipt is sent back in the response "ticket" for each
    // notification. In summary, sending a notification produces a ticket, which
    // contains a receipt ID you later use to get the receipt.
    //
    // The receipts may contain error codes to which you must respond. In
    // particular, Apple or Google may block apps that continue to send
    // notifications to devices that have blocked notifications or have uninstalled
    // your app. Expo does not control this policy and sends back the feedback from
    // Apple and Google so you can handle it appropriately.
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
            try {
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                // The receipts specify whether Apple or Google successfully received the
                // notification and information about an error, if one occurred.
                for (let receiptId in receipts) {
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console.error(`There was an error sending a notification: ${message}`);
                        if (details && details.error) {
                            // The error codes are listed in the Expo documentation:
                            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                            // You must handle the errors appropriately.
                            console.error(`The error code is ${details.error}`);
                            if (details.error === 'DeviceNotRegistered') {
                                // let ticketIdx = tickets.findIndex(receiptId);
                                //TODO: figure out token to remove from DB tokens when recipt says do not send anymore
                                // cbToRemoveTokenFromDB();
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    })();
}

const getDataForNotifications = async (countryCode = 'gb') => {
    // Read top 5 from general.json
    const filePath = path.resolve(__dirname, `../data/${countryCode}/general.json`);

    return readFile(filePath, 'utf8').then(fileContent => {
        let fileContentJson = fileContent && JSON.parse(fileContent) || { articles: [] };
        fileContentJson = fileContentJson.articles.slice(0,5);
        return fileContentJson;
    }).catch(err => {
        console.error('NOTIFICATIONS: error reading file!');
        return err;
    });
}

module.exports = {
    startSendingNotifications,
    getDataForNotifications
};
