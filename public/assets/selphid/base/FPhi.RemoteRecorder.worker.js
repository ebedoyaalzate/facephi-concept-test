
self.wsReady=false;
self.ws = new WebSocket("wss://ws-dev.idcapture.es");
self.ws.onopen = function() {
    postMessage({cmd:"ready"});
};
self.ws.onmessage = function(e) {
    postMessage({cmd:"message",data:e.data});
};
self.ws.onerror = function(e) {
    console.log(e);
    postMessage({cmd:"ws_onerror"});
};

self.onmessage = function (oEvent) {

        if (oEvent.data.cmd == "addFrame") {

            //let offCanvas = new OffscreenCanvas(oEvent.data.data.width,oEvent.data.data.height);
            //offCanvas.getContext('2d').putImageData(oEvent.data.data, 0, 0);
            //let blob = offCanvas.convertToBlob();
            self.ws.send('{"type":"VIDEO_FRAME","dataURL":"'+oEvent.data.data+'"}');
            

        } else if (oEvent.data.cmd == "generateVideo") {

            //var toReturn = { cmd: "generateVideo" };
            //postMessage(toReturn);
            let command = '{"type":"MAKE_VIDEO","FR":'+oEvent.data.fr+'}';
            self.ws.send(command);

        } else {
            postMessage({ cmd: "unknownMessage" });
        }
}
