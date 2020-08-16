console.log('content script loaded')

console.log('chrome ref:', chrome);

const MESSAGE_TYPES = {
    HTTP_CHECK_URL: 'HTTP_CHECK_URL',
    HTTP_UPLOAD_SCRIPT_FILE: 'HTTP_UPLOAD_SCRIPT_FILE',
    CONTENT_SCRIPT_FOUND: 'CONTENT_SCRIPT_FOUND',
    CONTENT_SCRIPT_NOT_FOUND: 'CONTENT_SCRIPT_NOT_FOUND'
}

function syncHandyDeviceWithVideo() {
    // do some sync logic
    console.log('Syncing ....');
}

function handleFileUpload(input) {
    // upload file

    if (input && input.files && input.files.length > 0) {
        var fileReader = new FileReader();
        fileReader.readAsText(input.files[0]);
        fileReader.onloadend = function (event) {
            const result = event.target.result;

            console.log('Uploading file...');

            chrome.runtime.sendMessage(
                {
                    type: MESSAGE_TYPES.HTTP_UPLOAD_SCRIPT_FILE,
                    file: result
                },
                null,
                (success) => {
                    if (success) {
                        insertScriptFoundUI();
                    } else {
                        alert("Uhh, something went wrong with the upload, please try again later.");
                    }
                });
        }
    }
}

function insertScriptFoundUI() {
    if (document.getElementById("handy-ui-wrapper")) {
        document.body.removeChild(document.getElementById("handy-ui-wrapper"));
    }

    const uiWrapper = document.createElement("div");
    uiWrapper.style.top = "0px";
    uiWrapper.style.left = "0px";
    uiWrapper.style.position = "absolute";
    uiWrapper.style.height = "30px";
    uiWrapper.style.width = "100vw";
    uiWrapper.style.textAlign = "center";
    uiWrapper.style.background = "rgba(24, 255, 255, 0.5)";
    uiWrapper.style.paddingTop = "10px";

    const text = document.createElement("span");
    text.innerHTML = "Handy compatible video found ";

    const icon = document.createElement("img");
    icon.src = "https://cdn4.iconfinder.com/data/icons/css-cursors/48/jee-32-512.png";
    icon.style.width = "35px";
    icon.style.position = "absolute";
    icon.style.marginTop = "-10px";
    icon.style.cursor = "pointer";
    icon.onclick = () => {
        syncHandyDeviceWithVideo();
    };

    const button = document.createElement("span");
    button.innerHTML = " Sync";
    button.style.cursor = "pointer";
    button.style.color = "rgb(24, 188, 35)";
    button.style.fontWeight = "bold";
    button.style.marginLeft = "35px";
    button.onclick = () => {
        syncHandyDeviceWithVideo();
    };

    uiWrapper.appendChild(text);
    uiWrapper.appendChild(icon);
    uiWrapper.appendChild(button);

    document.body.style.paddingTop = "30px";
    document.body.appendChild(uiWrapper);
}

function insertScriptNotFoundUI() {
    if (document.getElementById("handy-ui-wrapper")) {
        document.body.removeChild(document.getElementById("handy-ui-wrapper"));
    }

    const uiWrapper = document.createElement("div");
    uiWrapper.id = "handy-ui-wrapper";
    uiWrapper.style.top = "0px";
    uiWrapper.style.left = "0px";
    uiWrapper.style.position = "absolute";
    uiWrapper.style.height = "30px";
    uiWrapper.style.width = "100vw";
    uiWrapper.style.textAlign = "center";
    uiWrapper.style.background = "rgba(24, 255, 255, 0.5)";
    uiWrapper.style.paddingTop = "10px";

    const hiddenInput = document.createElement("input");
    hiddenInput.id = "handy-file-upload";
    hiddenInput.type = "file";
    hiddenInput.accept = ".json,.csv";
    hiddenInput.style.display = "none";
    hiddenInput.onchange = (event) => {
        if (event && event.target) {
            handleFileUpload(event.target);
        }
    };

    const clickableText = document.createElement("span");
    clickableText.innerHTML = "Video not compatible with Handy, click HERE to upload a script.";
    clickableText.style.cursor = "pointer";
    clickableText.onclick = () => {
        document.getElementById('handy-file-upload').click();
    };

    uiWrapper.appendChild(hiddenInput);
    uiWrapper.appendChild(clickableText);

    document.body.style.paddingTop = "3px";
    document.body.appendChild(uiWrapper);
}

function main() {
    chrome.runtime.sendMessage(
        {
            type: 'HTTP_CHECK_URL',
            url: location.href
        },
        null,
        response => {
            console.log('response', response);
            if (response.scriptFound === true && response.uiEnabled === true) {
                insertScriptFoundUI();
            } else if (response.scriptFound === false && response.uiEnabled === true) {
                insertScriptNotFoundUI();
            }
        });
}

main();

// Communicate with background script
// var port = chrome.runtime.connect({ name: "content" });
// port.onMessage.addListener(function (message, sender) {
//     console.log(message, sender);
//     if (message.greeting === "hello") {
//         alert(message.greeting);
//     }
// });

// chrome.runtime.sendMessage({
//     type: 'HTTP_CHECK_URL',
//     url: location.href
// });