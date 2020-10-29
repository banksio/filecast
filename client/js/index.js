window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
};

const listFilesDiscovered = document.getElementById("list-files");
const selectIP = document.getElementById("select-ip");
const btnFileRescan = document.getElementById("btnFileRescan");
const inputMediaType = document.getElementById("input-cast-mediatype");

initializeCastApi = function () {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId:
            chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    });
    

};

function play() {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();

    var mediaInfo = new chrome.cast.media.MediaInfo("http://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/uk/sbr_high/ak/bbc_radio_two.m3u8", inputMediaType.value);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    castSession.loadMedia(request).then(
        function () { console.log('Load succeed'); },
        function (errorCode) { console.log('Error code: ' + errorCode); });
    var player = new cast.framework.RemotePlayer();
    var playerController = new cast.framework.RemotePlayerController(player);
    playerController.playOrPause();
}

function playURL(url) {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    // alert(inputMediaType.value);
    var mediaInfo = new chrome.cast.media.MediaInfo(url, inputMediaType.value);
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    castSession.loadMedia(request).then(
        function () { console.log('Load succeed'); },
        function (errorCode) { console.log('Error code: ' + errorCode); });
    var player = new cast.framework.RemotePlayer();
    var playerController = new cast.framework.RemotePlayerController(player);
    playerController.playOrPause();
}

const btnPlayURL = document.getElementById("btn-cast-url");
const inputMediaURL = document.getElementById("input-cast-url");

btnPlayURL.addEventListener("click", (event) => {
    playURL(inputMediaURL.value);
})

btnFileRescan.addEventListener("click", (event) => {
    getFileList();
})

selectIP.addEventListener("change", (event) => {
    updateLANIP(event.target.value);
})

const IP = {}

function updateLANIP(newIP) {
    IP.lan = newIP;
}

getIP().then(frontendUpdateIPSelector());

function frontendUpdateIPSelector() {
    return json => {
        selectIP.innerHTML = "";
        let first = true;
        for (ip of json) {
            selectIP.innerHTML = selectIP.innerHTML + "<option " + (first ? "selected " : "") + "value='" + ip + "'>" + ip + "</option>";
            if (first) updateLANIP(ip);
            first = false;
        }
    };
}

async function getFileList() {
    fetch("http://" + window.location.hostname + "/media").then(response => {
        if (response.status == 404) {
            return undefined;
        }
        return response.json()
    })
    .then(data => {
        if(!data) {
            listFilesDiscovered.innerHTML = "<li>Nothing yet, pick a folder in the server and click Re-Scan.</li>";
            return;
        }
        listFilesDiscovered.innerHTML = "";
        for (path of data.paths) {
            listFilesDiscovered.innerHTML += "<li><button class='btn btn-outline-secondary btn-sm fileBtn'>" + path + "</button></li>";
        }
        for (button of document.getElementsByClassName("fileBtn")) {
            button.addEventListener("click", (event) => {
                // alert("http://" + IP.lan + "/media/" + event.target.innerText);
                playURL("http://" + IP.lan + "/media/" + event.target.innerText);
            })
        }
    }).catch((err) => {
        alert(err);
    });
}

async function getIP() {
    const response = await fetch("http://" + window.location.hostname + "/ip").catch((err) => {
        alert(err);
    });
    return await response.json();
}

getFileList();