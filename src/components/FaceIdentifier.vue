<template>
  <div class="container p-3">
      <div class="row h-100">
          <!-- Contenedor del widget web SelphID -->
          <div class="col-12 col-md-9" style="min-height: 550px;">
              <facephi-selphi
                  v-if="isWidgetStarted"

                  language="es"

                  :bundlePath="bundlePath"

                  :livenessMode="livenessMode"
                  :interactible="interactible"
                  :tutorial="showTutorial"
                  :stabilizationStage="stabilizationStage"
                  :videoRecord="recordVideoSession"
                  :showLog="showLog"
                  :debugMode="debugMode"

                  :cameraWidth="cameraWidth"
                  :cameraHeight="cameraHeight"
                  :cameraType="cameraType"

                  :logImages="logImages"

                  @onmoduleloaded="onModuleLoaded"
                  @onstabilizing="onStabilizing"
                  @onextractionfinish="onExtractionFinish"
                  @onusercancel="onUserCancel"
                  @onexceptioncaptured="onExceptionCaptured"
                  @onlivenesserror="onLivenessError"
                  @onlivenesserrorbuttonclick="onLivenessErrorButtonClick"
                  @onextractiontimeout="onExtractionTimeout"
                  @ontimeouterrorbuttonclick="onTimeoutErrorButtonClick"
                  @ontrackstatus="onTrackStatus"
              ></facephi-selphi>
          </div>

          <!-- Elementos de configuración del widget -->
          <div class="col-12 col-md-3 mt-3 mt-md-0">
              <div class="form-group">
                  <label for="widgetLivenessMode">Liveness mode</label>
                  <select id="widgetLivenessMode" class="form-control" :disabled="isWidgetStarted"
                          v-model="livenessMode">
                      <option :value="livenessModeEnum.None">None</option>
                      <option :value="livenessModeEnum.Passive" selected>Passive</option>
                  </select>
              </div>
              <div class="form-group form-check m-0">
                  <input type="checkbox" id="widgetInteractible" class="form-check-input"
                          :disabled="isWidgetStarted" v-model="interactible"/>
                  <label for="widgetInteractible" class="form-check-label">Interactible</label>
              </div>
              <div class="form-group form-check m-0">
                  <input type="checkbox" id="widgetTutorial" class="form-check-input" :disabled="isWidgetStarted"
                          v-model="showTutorial"/>
                  <label for="widgetTutorial" class="form-check-label">Tutorial</label>
              </div>
              <div class="form-group form-check m-0">
                  <input type="checkbox" id="widgetStabilizationStage" class="form-check-input"
                          :disabled="isWidgetStarted" v-model="stabilizationStage"/>
                  <label for="widgetStabilizationStage" class="form-check-label">Stabilization Stage</label>
              </div>
              <div class="form-group form-check m-0">
                  <input type="checkbox" id="widgetVideoRecord" class="form-check-input"
                          :disabled="isWidgetStarted" v-model="recordVideoSession"/>
                  <label for="widgetVideoRecord" class="form-check-label">Record video session</label>
              </div>
              <div class="form-group form-check m-0">
                  <input type="checkbox" id="widgetShowLog" class="form-check-input" :disabled="isWidgetStarted"
                          v-model="showLog"/>
                  <label for="widgetShowLog" class="form-check-label">Show extended log</label>
              </div>
              <div class="form-group form-check">
                  <input type="checkbox" id="debugMode" class="form-check-input" :disabled="isWidgetStarted"
                          v-model="debugMode"/>
                  <label for="debugMode" class="form-check-label">Debug</label>
              </div>
              <div class="form-group">
                  <label for="widgetCameraResolution">Camera resolution</label>
                  <select id="widgetCameraResolution" class="form-control" :disabled="isWidgetStarted"
                          v-model="cameraResolution" @change="setCameraResolutions($event)">
                      <option value="640x480">640x480</option>
                      <option value="800x600">800x600</option>
                      <option value="1024x768">1024x768</option>
                      <option value="1280x720">1280x720 (720p)</option>
                      <option value="1920x1080">1920x1080 (1080p)</option>
                  </select>
              </div>
              <div class="form-group">
                  <label for="widgetCameraType">Camera type</label>
                  <select id="widgetCameraType" class="form-control" :disabled="isWidgetStarted"
                          v-model="cameraType">
                      <option :value="cameraTypeEnum.Front">Front</option>
                      <option :value="cameraTypeEnum.Back">Back</option>
                  </select>
              </div>

              <button type="button" id="btnStartCapture" class="btn btn-primary btn-block"
                      :disabled="isWidgetStarted" v-on:click.self="enableWidget">Start capture
              </button>
              <button type="button" id="btnStopCapture" class="btn btn-danger btn-block"
                      :disabled="!isWidgetStarted" v-on:click.self="disableWidget">Stop capture
              </button>
          </div>
      </div>
  </div>
</template>

<script>
import {FPhi} from "@facephi/selphi-widget-web";

export default {
    name: 'FaceIdentifier',
    data: function () {
        return {
            isWidgetStarted: false,
            bundlePath: '../assets/selphi',
            livenessMode: FPhi.Selphi.LivenessMode.Passive,
            cameraWidth: 1280,
            cameraHeight: 720,
            cameraResolution: "1280x720",
            cameraType: FPhi.Selphi.CameraType.Front,
            interactible: true,
            showTutorial: false,
            stabilizationStage: false,
            recordVideoSession: false,
            logImages: true,
            showLog: false,
            debugMode: false,

            // Export enums for the template
            cameraTypeEnum: FPhi.Selphi.CameraType,
            livenessModeEnum: FPhi.Selphi.LivenessMode
        }
    },
    methods: {
        onModuleLoaded: function (eventData) {
            console.warn("[Selphi] onModuleLoaded");
            console.log(eventData);
        },

        onStabilizing: function (stabilizingResult) {
            console.warn("[Selphi] onStabilizing");
            console.log(stabilizingResult);
        },

        onExtractionFinish: function (extractionResult) {
            console.warn("[Selphi] onExtractionFinish");
            console.log(extractionResult);

            console.log("Images returned: ", extractionResult.detail.images);

            for (let i = 0; i < extractionResult.detail.images.length; i++) {
                const img = extractionResult.detail.images[i];
                console.log(`Image ${i}: ${img.src}`);
            }

            if (extractionResult.detail.bestImage)
                console.log("BestImage: ", extractionResult.detail.bestImage.src);

            if (extractionResult.detail.bestImageCropped)
                console.log("BestImageCropped: ", extractionResult.detail.bestImageCropped.src);

            console.log("Template: ", extractionResult.detail.template);
            console.log("TemplateRaw: ", extractionResult.detail.templateRaw);
            console.log("TimeStamp: ", extractionResult.detail.timeStamp);

            console.log("LivenessMoveFails: ", extractionResult.detail.livenessMoveFails);
            console.log("SunGlassesScore: ", extractionResult.detail.sunGlassesScore);

            console.log("LivenessMoveHistory: ", extractionResult.detail.livenessMoveHistory);
            console.log("LivenessMoveStabilizedStatusHistory: ", extractionResult.detail.livenessMoveStabilizedStatusHistory);
            console.log("LivenessMoveLastStabilizedStatus: ", extractionResult.detail.livenessMoveLastStabilizedStatus);

            if (extractionResult.detail.bestImage) {
                FPhi.Selphi.Component.generateTemplateRawFromByteArray("../assets/selphi", extractionResult.detail.bestImage, result => {
                    console.log("BestImage Template Raw: ", result);
                });
            }

            this.isWidgetStarted = false;
            this.$emit('face-identified', extractionResult)
        },

        onUserCancel: function () {
            console.warn("[Selphi] onUserCancel");

            this.isWidgetStarted = false;
        },

        onExceptionCaptured: function (exceptionResult) {
            console.warn("[Selphi] onExceptionCaptured");
            console.log(`exceptionType: ${exceptionResult.detail.exceptionType}`);
            console.log(`exceptionMessage: ${exceptionResult.detail.message}`);
            console.log(exceptionResult);

            this.isWidgetStarted = false;
        },

        onLivenessError: function (livenessErrorResult) {
            console.warn("[Selphi] onLivenessError");
            console.log(livenessErrorResult);

            switch (livenessErrorResult.detail.livenessErrorType) {
                case FPhi.Selphi.LivenessDiagnostic.Unsuccess:
                    console.log("[Selphi] Liveness error: Blink or movement not detected")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessLowPerformance:
                    console.log("[Selphi] Liveness error: Low performance")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessGlasses:
                    console.log("[Selphi] Liveness error: Glasses detected")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessLight:
                    console.log("[Selphi] Liveness error: Bad lighting conditions")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessNoMovement:
                    console.log("[Selphi] Liveness error: No movement")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessWrongDirection:
                    console.log("[Selphi] Liveness error: Wrong direction")
                    break;
                case FPhi.Selphi.LivenessDiagnostic.UnsuccessTooFar:
                    console.log("[Selphi] Liveness error: Face too far")
                    break;
            }
        },

        onLivenessErrorButtonClick: function () {
            console.warn("[Selphi] onLivenessErrorButtonClick");

            this.isWidgetStarted = false;
        },

        onExtractionTimeout: function (extractionTimeoutResult) {
            console.warn("[Selphi] onExtractionTimeout");
            console.log(extractionTimeoutResult);
        },

        onTimeoutErrorButtonClick: function () {
            console.warn("[Selphi] onTimeoutErrorButtonClick");

            this.isWidgetStarted = false;
        },

        onTrackStatus: function (eventData) {
            let trackStatusCode = Object.entries(FPhi.Selphi.TrackStatus).find(e => e[1] === eventData.detail.code);
            console.warn(`[Selphi] onTrackStatus (Code: ${trackStatusCode[1]} - ${trackStatusCode[0]}, Timestamp: ${eventData.detail.timeStamp}`);
            console.log(eventData);
        },

        setCameraResolutions: function (event) {
            switch (event.target.value) {
                case "640x480":
                    this.cameraWidth = 640;
                    this.cameraHeight = 480;
                    break;
                case "800x600":
                    this.cameraWidth = 800;
                    this.cameraHeight = 600;
                    break;
                case "1024x768":
                    this.cameraWidth = 1024;
                    this.cameraHeight = 768;
                    break;
                case "1280x720":
                    this.cameraWidth = 1280;
                    this.cameraHeight = 720;
                    break;
                case "1920x1080":
                    this.cameraWidth = 1920;
                    this.cameraHeight = 1080;
                    break;
            }
        },

        disableWidget: function () {
            this.isWidgetStarted = false;
        },

        enableWidget: function () {
            this.isWidgetStarted = true;
        }
    }
}
</script>

<style>

</style>