// widget webassembly 5.5.2 async webworker

var Module = {
    onRuntimeInitialized:function () {
        
        //self.livenessTimer = new Module.LivenessTimer();
        
        self.postMessage({ cmd: "ready" });
    },
};

var extractorLoaded=false;
while (extractorLoaded==false) {
    try {
        importScripts('FPhiExtractor.js');
        extractorLoaded=true;
    } catch (error) {
        extractorLoaded=false;
    }
}

var extractor = undefined;
var extractorLiveness = undefined;
var extractorLivenessMove = undefined;
var livenessTimer = undefined;
var lastExtractionResult = undefined;

function Uint8ToString(u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}

function tokenize(data) {
    let extractor = new Module.Extractor();
    let myVector = new Module.VectorUchar();
    let length = data.length;
    for(var i = 0; i < length; i++){
        myVector.push_back(data.charCodeAt(i));
    }

    var tokenizado = extractor.tokenize(myVector);
    var arraybyte = Module.getBytes(tokenizado);
    //var b64encoded = btoa(String.fromCharCode.apply(null, arraybyte));
    var b64encoded = btoa(Uint8ToString(arraybyte));

    myVector.delete();
    if (extractor != undefined) extractor.delete();
    return b64encoded;
}

self.onmessage = function (oEvent) {

    //try {
        if (oEvent.data.cmd == "tokenize") {
            
            var toReturn = {cmd:"tokenize", data:tokenize(oEvent.data.data)};
            postMessage(toReturn);

        } else if (oEvent.data.cmd == "detect") {

            var toReturn = { cmd: "detect" };

            //toReturn.sampleDiagnostic = 1;

            var fphiImage = Module.Image.getFPhiImage(oEvent.data.data, oEvent.data.height, oEvent.data.width, Module.ImageFormat.RGBA_32bpp);
            var extractionResults = self.extractor.detect(fphiImage);
            if (extractionResults) {
                var extractionResult = extractionResults.get(0);
                toReturn.sampleDiagnostic = extractionResult.getSampleDiagnostic().value; // cannot return webassembly enums. return integer value.
                if (extractionResult.getSampleDiagnostic() == Module.SampleDiagnostic.Ok) {

                    var face = extractionResult.getFace();
                    var leftEye = extractionResult.getLeftEye();
                    var rightEye = extractionResult.getRightEye();

                    if (face != null) {
                        toReturn.face = { x: face.X, y: face.Y, width: face.Width, height: face.Height };
                    }

                    if (leftEye != null) {
                        toReturn.leftEye = { x: leftEye.X, y: leftEye.Y };
                    }

                    if (rightEye != null) {
                        toReturn.rightEye = { x: rightEye.X, y: rightEye.Y };
                    }
                }
                extractionResult.delete();
            }

            fphiImage.delete();
            extractionResults.delete();

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "extractNextSmart") {

            var toReturn = { cmd: "extractNextSmart" };
            var fphiImage = Module.Image.getFPhiImage(oEvent.data.data, oEvent.data.height, oEvent.data.width, Module.ImageFormat.RGBA_32bpp);
            var extractionResult = self.extractor.extractNextSmart(fphiImage);
            if (self.lastExtractionResult != undefined) {
                self.lastExtractionResult.delete();
            }
            self.lastExtractionResult = extractionResult;

            toReturn.sampleDiagnostic = extractionResult.getSampleDiagnostic().value; // cannot return webassembly enums. return integer value.
            if (extractionResult.getSampleDiagnostic() == Module.SampleDiagnostic.Ok) {

                var face = extractionResult.getFace();
                var leftEye = extractionResult.getLeftEye();
                var rightEye = extractionResult.getRightEye();

                if (face != null) {
                    toReturn.face = { x: face.X, y: face.Y, width: face.Width, height: face.Height };
                }

                if (leftEye != null) {
                    toReturn.leftEye = { x: leftEye.X, y: leftEye.Y };
                }

                if (rightEye != null) {
                    toReturn.rightEye = { x: rightEye.X, y: rightEye.Y };
                }

                var facialTemplate = extractionResult.getTemplate();
                var arraybyte = Module.getBytes(facialTemplate);
                toReturn.template = new Uint8Array(arraybyte);
                facialTemplate.delete();

                var facialTemplateRaw = extractionResult.getTemplateRaw();
                var arraybyteRaw = Module.getBytes(facialTemplateRaw);
                toReturn.templateRaw = new Uint8Array(arraybyteRaw);
                facialTemplateRaw.delete();

                var ti = extractionResult.getTemplateInfo();
                toReturn.templateScore = ti.getTemplateScore();
                toReturn.facialScore = extractionResult.getFacialScore();
                toReturn.sunGlassesScore = ti.getSunGlassesScore();
                ti.delete();
                
            }
            //extractionResult.delete();

            fphiImage.delete();

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "initStreamExtraction") {

            self.extractor.stopStreamExtraction();
            if (oEvent.data.extractionMode == 1) {
                var extractionMode = Module.ExtractionMode.Register;
                var opts = new Module.ExtractionOptions();
                opts.setExtractionMode(extractionMode);
                opts.setRawTemplates(1);
                //opts.setUserTags(self.userTags);
                self.extractor.initStreamExtractionSmartWithExtractionOptions(opts);
                opts.delete();
            } else {
                var extractionMode = Module.ExtractionMode.Authenticate;
                var opts = new Module.ExtractionOptions();
                opts.setExtractionMode(extractionMode);
                opts.setRawTemplates(1);
                if (oEvent.data.livenessMode == 0)
                    opts.setLivenessTag(0);
                else
                    opts.setLivenessTag(1);
                //opts.setUserTags(self.userTags);
				//opts.setlivenessPrecision(0);
                self.extractor.initStreamExtractionSmartWithExtractionOptions(opts);
                opts.delete();
            }

            var toReturn = { cmd: "initStreamExtraction" };
            postMessage(toReturn);

        } else if (oEvent.data.cmd == "evaluateLiveness") {

            var toReturn = { cmd: "evaluateLiveness" };

            var tempImages = new Module.VectorImages();
            for (var a = 0; a < oEvent.data.images.length; a++) {
                var fphiImage = Module.Image.getFPhiImage(oEvent.data.images[a].pixels.data, oEvent.data.images[a].height, oEvent.data.images[a].width, Module.ImageFormat.RGBA_32bpp);
                tempImages.push_back(fphiImage);
            }

            var livenessTimerDiagnostic = self.livenessTimer.evaluate();
            var facialTemplate = self.lastExtractionResult.getTemplate();
            var livenessResult = self.extractorLiveness.evaluateLiveness(tempImages, livenessTimerDiagnostic, facialTemplate);
            for (var a = 0; a < oEvent.data.images.length; a++)
                tempImages.get(a).delete();
            tempImages.delete();
            facialTemplate.delete();
            livenessTimerDiagnostic.delete();

            toReturn.livenessDiagnostic = livenessResult.getLivenessDiagnostic().value;
            toReturn.penalty = livenessResult.getPenalty();

            livenessResult.delete();

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "livenessTimerReset") {

            self.livenessTimer.reset();
            postMessage({ cmd: "livenessTimerReset" });

        } else if (oEvent.data.cmd == "livenessTimerSetValues") {

            self.livenessTimer.setValues(oEvent.data.timeLapse, oEvent.data.fps, 0);
            postMessage({ cmd: "livenessTimerSetValues" });

        } else if (oEvent.data.cmd == "livenessTimerAdd") {

            var returnValue = self.livenessTimer.add(oEvent.data.milliseconds);
            var isFullValue = self.livenessTimer.isFull();
            if (isFullValue) {
                self.livenessTimer.evaluate();
            }
            var toReturn = { cmd: "livenessTimerAdd", status: returnValue, isFull: isFullValue };
            postMessage(toReturn);

        } else if (oEvent.data.cmd == "initLivenessMoveStabilization") {

            self.extractor.initLivenessHMCCStabilization();
            this.postMessage({ cmd: "initLivenessMoveStabilization" });

        } else if (oEvent.data.cmd == "initLivenessMoveSequence") {

            var extractionMode = Module.ExtractionMode.Authenticate;
            var livenessPrecisionValue = Module.LivenessDetectionPrecision.Low;

            if (oEvent.data.livenessPrecision == 1) {
                
                livenessPrecisionValue = Module.LivenessDetectionPrecision.Medium;
            }

            if (oEvent.data.livenessPrecision == 2) {

                livenessPrecisionValue = Module.LivenessDetectionPrecision.High;
            }

            var opts = new Module.ExtractionOptions();
            opts.setExtractionMode(extractionMode);
            opts.setRawTemplates(1);
            opts.setLivenessTag(2);
            opts.setLivenessDetectionPrecision(livenessPrecisionValue);

            self.extractorLivenessMove.initLivenessHMCCSequence(opts);

            this.postMessage({ cmd: "initLivenessMoveSequence", livenessPrecision: livenessPrecisionValue});

        } else if (oEvent.data.cmd == "nextLivenessMoveSequence") {

            var result = self.extractorLivenessMove.nextLivenessHMCCSequence();
            var directionMovement = result.getLivenessHeadMovement();
            var livenessDirection = 0;
            switch (directionMovement) {
                case Module.LivenessHeadMovement.CenterLeft:
                    livenessDirection = 1;
                    break;
                case Module.LivenessHeadMovement.CenterDown:
                    livenessDirection = 2;
                    break;
                case Module.LivenessHeadMovement.CenterRight:
                    livenessDirection = 3;
                    break;
            }
            result.delete();
            this.postMessage({ cmd: "nextLivenessMoveSequence",direction:livenessDirection});

        } else if (oEvent.data.cmd == "nextLivenessMoveStabilization") {

            var toReturn = { cmd: "nextLivenessMoveStabilization" };
            var fphiImage = Module.Image.getFPhiImage(oEvent.data.data, oEvent.data.height, oEvent.data.width, Module.ImageFormat.RGBA_32bpp);
            var extractionResult = self.extractor.nextLivenessHMCCStabilization(fphiImage, performance.now());
            if (self.lastExtractionResult != undefined) {
                self.lastExtractionResult.delete();
            }
            self.lastExtractionResult = extractionResult;

            toReturn.sampleDiagnostic = extractionResult.getSampleDiagnostic().value; // cannot return webassembly enums. return integer value.
            if (extractionResult.getSampleDiagnostic() == Module.SampleDiagnostic.Ok) {

                var facialTemplate = extractionResult.getTemplate();
                var arraybyte = Module.getBytes(facialTemplate);
                toReturn.template = new Uint8Array(arraybyte);
                facialTemplate.delete();

                var facialTemplateRaw = extractionResult.getTemplateRaw();
                var arraybyteRaw = Module.getBytes(facialTemplateRaw);
                toReturn.templateRaw = new Uint8Array(arraybyteRaw);
                facialTemplateRaw.delete();

                var ti = extractionResult.getTemplateInfo();
                toReturn.templateScore = ti.getTemplateScore();
                toReturn.facialScore = extractionResult.getFacialScore();
                toReturn.sunGlassesScore = ti.getSunGlassesScore();
                ti.delete();

            }
            
            var face = extractionResult.getFace();
            var leftEye = extractionResult.getLeftEye();
            var rightEye = extractionResult.getRightEye();
            
            if (extractionResult.getFaceAvailable()==true) {
                toReturn.face = { x: face.X, y: face.Y, width: face.Width, height: face.Height };
            }
            
            if (extractionResult.getLeftEyeAvailable()==true) {
                toReturn.leftEye = { x: leftEye.X, y: leftEye.Y };
            }
            
            if (extractionResult.getRightEyeAvailable()==true) {
                toReturn.rightEye = { x: rightEye.X, y: rightEye.Y };
            }
            
            toReturn.faceStabilized = extractionResult.getFaceStabilizedStatus();

            //extractionResult.delete();
            fphiImage.delete();

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "nextLivenessMoveImage") {

            var toReturn = { cmd: "nextLivenessMoveImage" };
            var fphiImage = Module.Image.getFPhiImage(oEvent.data.data, oEvent.data.height, oEvent.data.width, Module.ImageFormat.RGBA_32bpp);
            var extractionResult = self.extractorLivenessMove.nextLivenessHMCCImage(fphiImage);
            if (self.lastExtractionResult != undefined) {
                self.lastExtractionResult.delete();
            }
            self.lastExtractionResult = extractionResult;

            toReturn.sampleDiagnostic = extractionResult.getSampleDiagnostic().value; // cannot return webassembly enums. return integer value.
            if (extractionResult.getSampleDiagnostic() == Module.SampleDiagnostic.Ok) {

                var face = extractionResult.getFace();
                var leftEye = extractionResult.getLeftEye();
                var rightEye = extractionResult.getRightEye();

                if (face != null) {
                    toReturn.face = { x: face.X, y: face.Y, width: face.Width, height: face.Height };
                }

                if (leftEye != null) {
                    toReturn.leftEye = { x: leftEye.X, y: leftEye.Y };
                }

                if (rightEye != null) {
                    toReturn.rightEye = { x: rightEye.X, y: rightEye.Y };
                }

                var facialTemplate = extractionResult.getTemplate();
                var arraybyte = Module.getBytes(facialTemplate);
                toReturn.template = new Uint8Array(arraybyte);
                facialTemplate.delete();

                var facialTemplateRaw = extractionResult.getTemplateRaw();
                var arraybyteRaw = Module.getBytes(facialTemplateRaw);
                toReturn.templateRaw = new Uint8Array(arraybyteRaw);
                facialTemplateRaw.delete();

                var ti = extractionResult.getTemplateInfo();
                toReturn.templateScore = ti.getTemplateScore();
                toReturn.facialScore = extractionResult.getFacialScore();
                toReturn.sunGlassesScore = ti.getSunGlassesScore();
                ti.delete();

            }
            //extractionResult.delete();
            fphiImage.delete();

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "evaluateLivenessMove") {

            var toReturn = { cmd: "evaluateLivenessMove" };
            var jtimer = oEvent.data.timer;
            self.livenessTimer.setValues(jtimer.timeLapse,jtimer.desiredFPS, jtimer.initialOffset);
            self.livenessTimer.reset();
            for (var a=0; a<jtimer.timeCodes.length; a++)
                self.livenessTimer.add(jtimer.timeCodes[a]);
            var isFullValue = self.livenessTimer.isFull();
            if (isFullValue) {
                self.livenessTimer.evaluate();
            }

            var extractionResult = self.extractorLivenessMove.evaluateLivenessHMCChallenge(self.livenessTimer);
            if (self.lastExtractionResult != undefined) {
                self.lastExtractionResult.delete();
            }
            self.lastExtractionResult = extractionResult;

            var livenessDiagnostic = extractionResult.getLivenessDiagnostic();
            toReturn.livenessDiagnostic = livenessDiagnostic.value;

            toReturn.sampleDiagnostic = extractionResult.getSampleDiagnostic().value; // cannot return webassembly enums. return integer value.
            if (livenessDiagnostic == Module.LivenessDiagnostic.LivenessDetected) {
                
                var facialTemplate = extractionResult.getTemplate();
                var arraybyte = Module.getBytes(facialTemplate);
                toReturn.template = new Uint8Array(arraybyte);
                facialTemplate.delete();
             
                var facialTemplateRaw = extractionResult.getTemplateRaw();
                var arraybyteRaw = Module.getBytes(facialTemplateRaw);
                toReturn.templateRaw = new Uint8Array(arraybyteRaw);
                facialTemplateRaw.delete();

                var ti = extractionResult.getTemplateInfo();
                toReturn.templateScore = ti.getTemplateScore();
                toReturn.facialScore = extractionResult.getFacialScore();
                toReturn.sunGlassesScore = ti.getSunGlassesScore();
                ti.delete();
                
            }

            postMessage(toReturn);

        } else if (oEvent.data.cmd == "init") {
            
            var minIOD = oEvent.data.minIOD;
            var maxIOD = oEvent.data.maxIOD;
            var cameraWidth = oEvent.data.cameraWidth;
            var cameraHeight = oEvent.data.cameraHeight;
            var extractionMode = oEvent.data.extractionMode;
            var livenessMode = oEvent.data.livenessMode;
            var stabilizationStage = oEvent.data.stabilizationStage;
            
            // regular extractor
            var ecm = new Module.ExtractorConfigurationManager();
            ecm.setMinimumDistanceBetweenEyesAllowed(minIOD);
            //ecm.setMaximumDistanceBetweenEyesAllowed(maxIOD);
            ecm.setImageQualityFilter(Module.ImageQualityFilter.Medium);
            ecm.setPatternQualityFilter(Module.PatternQualityFilter.Medium);
            ecm.setMinimumDistanceBetweenEyesAllowed(minIOD);
            self.extractor = new Module.Extractor(ecm);
            //Module.destroy(ecm);
            ecm.delete();
            
            postMessage({ cmd: "init" });

        } else if (oEvent.data.cmd == "destroy") {
            if (self.extractor != undefined) self.extractor.delete();
            if (self.extractorLiveness != undefined) self.extractorLiveness.delete();
            if (self.extractorLivenessMove != undefined) self.extractorLivenessMove.delete();
            //self.livenessTimer.delete();
            if (self.lastExtractionResult != undefined)
                self.lastExtractionResult.delete();
            Module = null;
            close();

        } else {
            postMessage({ cmd: "unknownMessage" });
        }
}
