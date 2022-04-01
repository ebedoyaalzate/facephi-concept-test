importScripts('FPBRecognition.js');

let documentModel;
let options;
var Module = {
  onRuntimeInitialized: async function () {
    //Load model
    var cmodel = await fetch('facephi_corners_detector_model.dat');
    documentModel = new Uint8ClampedArray(await cmodel.arrayBuffer());
    postMessage({msg: 'bootedUp'});
  }
}


let detector;
let lastRunWorker;
let mps = 0;

// Module.addOnPostRun(() => {
//   postMessage({msg: 'bootedUp'});
// });

onmessage = function(e) {

  if(!lastRunWorker) {
    lastRunWorker = new Date().getTime();
  }

  let deltaWorker = (new Date().getTime() - lastRunWorker)/1000;
  lastRunWorker = new Date().getTime();
  mps = Math.round((1/deltaWorker)* 100) / 100;

  let res = {};
  res.mps = mps;
  res.contour = [];

  switch (e.data.msg) {
    case 'init':
          detector = new Module.DocumentCaptureEngine();
          let modelLoaded = detector.loadDocumentDataFromBuffer(documentModel);
          if(Module.getMessageErrorCodeDocument(modelLoaded) != "OK"){
            console.log("Error loading the model");
            res.diagnostic= Module.getMessageErrorCodeDocument(modelLoaded);
          }
          res.text = 'Capturando...'
          res.msg = 'init';
          break;
    case 'update':
          res.text = 'update...'
          res.msg = 'update';
          break;
    case 'detect':
          res.image = e.data.image;
          //let detected = detector.detectCard(e.data.image, null, e.data.width, e.data.height, e.data.roiWidth, e.data.roiHeight);
          try {
            var size = new Module.Size(e.data.image.width, e.data.image.height);
            var image = new Module.Image(e.data.image.data, size, Module.Orientation.FACE_UP, Module.ImageFormat.RGBA);
            let result = detector.recognizeFromImage(image);
            let errorTilt = 20;
            //console.log("Error: " + Module.getMessageErrorCodeDocument(result.error));
            //console.log("Diagnostic: " + Module.getMessageCaptureDiagnostic(result.diagnostic));
            if (result.error == Module.DocumentErrorCode.OK && result.diagnostic == Module.DocumentCaptureDiagnostic.OK){
              if(checkRatios(result.documentLocation)){
                //obtain croppedImage
                let docImage = Module.cropImageWithLocation(image,result.documentLocation);
                res.docImageBuff = docImage.data();
                res.docImageWidth = docImage.width();
                res.docImageHeight = docImage.height();
                res.msg = 'detected';
                res.text = res.mps;
                res.result = {
                  topRight:{
                    x:result.documentLocation.topRight.x,
                    y:result.documentLocation.topRight.y
                  },
                  topLeft:{
                    x:result.documentLocation.topLeft.x,
                    y:result.documentLocation.topLeft.y
                  },
                  bottomRight:{
                    x:result.documentLocation.bottomRight.x,
                    y:result.documentLocation.bottomRight.y
                  },
                  bottomLeft:{
                    x:result.documentLocation.bottomLeft.x,
                    y:result.documentLocation.bottomLeft.y
                  }
                };
              }
              else{
                res.msg = 'detected';
                res.text = res.mps;
                if(e.data.accesibility)
                  res.diagnostic = 0;
                else
                  res.diagnostic = errorTilt;
              }
            }
            else{
              res.msg = 'detected';
              res.text = res.mps;
              (e.data.accesibility)?(res.diagnostic=0):(res.diagnostic = result.diagnostic.value);
              
            }
            res.edges = [false,false,false,false];
            result.delete();
            image.delete();
            size.delete();
          } catch (err) {
              //console.log("Exception captured.",err);
              res.edges = [false,false,false,false];
          }
          break;
  }
  //console.log(res.mps);
  postMessage(res);
};
function checkRatios(location){
  let limitUp =1.05;
  let limitDown = 0.95;
  let WidthUp = Math.abs(location.topRight.x-location.topLeft.x);
  let WidthDown =Math.abs(location.bottomRight.x-location.bottomLeft.x);
  let heightLeft = Math.abs(location.bottomLeft.y-location.topLeft.y);
  let heightRight = Math.abs(location.bottomRight.y-location.topRight.y);
  let ratioWidth = (WidthUp/WidthDown);
  let ratioHeight = (heightLeft/heightRight);
  if (limitDown < ratioWidth && ratioWidth < limitUp && limitDown < ratioHeight && ratioHeight < limitUp){
    return true;
  }
  else{
    return false;
  }
}
