const MESSAGE_TYPES = {
    HTTP_CHECK_URL: 'HTTP_CHECK_URL',
    HTTP_UPLOAD_SCRIPT_FILE: 'HTTP_UPLOAD_SCRIPT_FILE',
    CONTENT_SCRIPT_FOUND: 'CONTENT_SCRIPT_FOUND',
    CONTENT_SCRIPT_NOT_FOUND: 'CONTENT_SCRIPT_NOT_FOUND'
}

chrome.runtime.onInstalled.addListener(function () {

    // chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    //     console.log(notificationId, buttonIndex);

    //     if (notificationId.startsWith("handy-script-found-notification-") && buttonIndex === 0) {
    //         console.log('view clicked');
    //     }
    // })

    console.log('chrome ref:', chrome);
    console.log('adding http listener ..');

    // chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    //     chrome.declarativeContent.onPageChanged.addRules([{
    //         conditions: [new chrome.declarativeContent.PageStateMatcher({
    //             pageUrl: { hostEquals: 'http://*' },
    //         })
    //         ],
    //         actions: [new chrome.declarativeContent.ShowPageAction()]
    //     }]);
    // });

    // Add listener for http requests
    chrome.runtime.onMessage.addListener(
        (request, sender, callback) => {

            if (MESSAGE_TYPES.HTTP_CHECK_URL == request.type) {
                var url = 'http://localhost:3001/check-url?url=' +
                    encodeURIComponent(request.url);

                console.log('fetching...', url);

                try {
                    fetch(url)
                        .then(response => {
                            if (response.status === 200) {
                                response.json().then(json => {
                                    console.log(json);

                                    if (json.script) {

                                        // Notify content.js about existing script
                                        callback({ scriptFound: true, uiEnabled: true });

                                        // Debug issue why notification is not showing
                                        // const notification = chrome.notifications.create(
                                        //     `handy-script-found-notification-${Math.floor(Math.random() * Math.floor(100000))}`,
                                        //     {
                                        //         type: "basic",
                                        //         iconUrl: chrome.extension.getURL('../images/get_started48.png'),
                                        //         title: 'Handy Compatible Video',
                                        //         message: "The video you're browsing is compatible with your Handy device!",
                                        //         buttons: [
                                        //             {
                                        //                 title: "View"
                                        //             }
                                        //         ]
                                        //     },
                                        //     (id, extras) => {
                                        //         console.log('notification-callback', id, extras);
                                        //         console.log("Last error:", chrome.runtime.lastError);

                                        //         setTimeout(() => {
                                        //             console.log(chrome.notifications);
                                        //             console.log(chrome.notifications.getAll());
                                        //             console.log(notification);
                                        //             notification.onclick = (e) => {
                                        //                 console.log(e);
                                        //             };
                                        //             notification.show();
                                        //         }, 100);
                                        //     }
                                        // );

                                    } else {
                                        callback({ scriptFound: false, uiEnabled: true });
                                    }
                                });
                            } else {
                                callback({ scriptFound: false, uiEnabled: true });
                            }

                            return response;
                        })
                        .catch(error => {
                            console.log(error);
                            callback({ scriptFound: false, uiEnabled: true });
                        });

                } catch (e) {
                    console.log(error);
                    callback({ scriptFound: false, uiEnabled: true });
                }

                return true;  // Will respond asynchronously.
            }

            if (MESSAGE_TYPES.HTTP_UPLOAD_SCRIPT_FILE === request.type) {
                const body = JSON.stringify({
                    file: request.file
                });

                fetch('http://localhost:3001/upload-file', {
                    method: 'post',
                    body,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.status === 200) {
                            callback(true);
                        } else {
                            callback(false);
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        callback(false);
                    });

                return true;  // Will respond asynchronously.
            }
        }
    );

    // Communicate with content script
    // chrome.runtime.onConnect.addListener((port) => {
    //     console.log('port ref:', port);

    //     port.postMessage({ data: 'test' });
    // });
});