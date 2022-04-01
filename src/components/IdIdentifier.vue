<template>
  <h1>ID Identifier</h1>
  <div class="container p-3">
    <div class="row h-100">
        <!-- Contenedor del widget web SelphID -->
        <div class="col-12 col-md-9" style="min-height: 550px;">
            <facephi-selphid
                v-if="isWidgetEnabled"

                language="es"

                :bundlepath="bundlePath"
                :style="'width: 100; height: ' + (forceLandscape ? '56.25%' : '100%') + ';'"

                :documentaspectratio="documentAspectRatio"

                :capturemode="captureMode"
                :previewcapture="previewCapture"
                :forcelandscape="forceLandscape"
                :initialtip="initialTip"

                :camerawidth="cameraWidth"
                :cameraHeight="cameraHeight"

                :captureSensibility="captureSensibility"
                :videorecord="videoRecord"
                :videorecordtype="videoRecordType"
                :videorecordscale="videoRecordScale"

                :debugmode="debugMode"

                @onmoduleloaded="onModuleLoaded"
                @onextractionfinished="onExtractionFinished"
                @onusercancelled="onUserCancelled"
                @onexceptioncaptured="onExceptionCaptured"
                @onextractiontimeout="onExtractionTimeout"
                @ontrackstatus="onTrackStatus"
            ></facephi-selphid>
        </div>

        <!-- Elementos de configuración del widget -->
        <div class="col-12 col-md-3 mt-3 mt-md-0">
            <div class="form-group">
                <label for="widgetCaptureMode">Capture mode</label>
                <select id="widgetCaptureMode" class="form-control" v-model="captureMode"
                        :disabled="isWidgetEnabled">
                    <option :value="captureModeEnum.Front">Front</option>
                    <option :value="captureModeEnum.Back">Back</option>
                    <option :value="captureModeEnum.Full">Full</option>
                </select>
            </div>
            <div class="form-group">
                <label for="widgetCameraResolution">Camera resolution</label>
                <select id="widgetCameraResolution" class="form-control" v-model="cameraResolution"
                        :disabled="isWidgetEnabled" @change="setCameraResolutions($event)">
                    <option value="640x480">640x480</option>
                    <option value="800x600">800x600</option>
                    <option value="1024x768">1024x768</option>
                    <option value="1280x720">1280x720 (720p)</option>
                    <option value="1920x1080">1920x1080 (1080p)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="widgetCaptureSensibility">Capture sensibility</label>
                <select id="widgetCaptureSensibility" class="form-control" v-model="captureSensibility"
                        :disabled="isWidgetEnabled">
                    <option :value="captureSensibilityEnum.Low">Low</option>
                    <option :value="captureSensibilityEnum.Normal">Normal</option>
                    <option :value="captureSensibilityEnum.High">High</option>
                    <option :value="captureSensibilityEnum.Auto">Auto</option>
                </select>
            </div>
            <div class="form-group form-check m-0">
                <input type="checkbox" id="previewCapture" class="form-check-input" v-model="previewCapture"
                        :disabled="isWidgetEnabled"/>
                <label for="previewCapture" class="form-check-label">Preview capture</label>
            </div>
            <div class="form-group form-check m-0">
                <input type="checkbox" id="forceLandscape" class="form-check-input" v-model="forceLandscape"
                        :disabled="isWidgetEnabled"/>
                <label for="forceLandscape" class="form-check-label">Force landscape</label>
            </div>
            <div class="form-group form-check m-0">
                <input type="checkbox" id="initialTip" class="form-check-input" v-model="initialTip"
                        :disabled="isWidgetEnabled"/>
                <label for="initialTip" class="form-check-label">Initial tip</label>
            </div>
            <div class="form-group form-check m-0">
                <input type="checkbox" id="widgetVideoRecord" class="form-check-input" v-model="videoRecord"
                        :disabled="isWidgetEnabled"/>
                <label for="widgetVideoRecord" class="form-check-label">Record video session</label>
            </div>
            <div class="form-group form-check m-0">
            </div>
            <div class="form-group form-check">
                <input type="checkbox" id="debugMode" class="form-check-input" v-model="debugMode"
                        :disabled="isWidgetEnabled"/>
                <label for="debugMode" class="form-check-label">Debug</label>
            </div>

            <button type="button" id="btnStartCapture" class="btn btn-primary btn-block"
                    :disabled="isWidgetEnabled"
                    v-on:click.self="enableWidget">Start capture
            </button>
            <button type="button" id="btnStopCapture" class="btn btn-danger btn-block"
                    :disabled="!isWidgetEnabled"
                    v-on:click.self="disableWidget">Stop capture
            </button>
        </div>
    </div>
  </div>
</template>

<script>
import {FPhi} from "@facephi/selphid-widget-web";

export default {
    name: 'IdIdentifier',
    data: function () {
        return {
            bundlePath: "../assets/selphid",
            documentAspectRatio: 85.60 / 53.98,
            captureMode: FPhi.SelphID.Mode.Full,
            previewCapture: true,
            forceLandscape: false,
            initialTip: false,
            cameraWidth: 1280,
            cameraHeight: 720,
            captureSensibility: FPhi.SelphID.CaptureSensibility.Auto,
            videoRecord: false,
            videoRecordType: FPhi.SelphID.RecorderType.Remote,
            videoRecordScale: this.cameraWidth < 1280 ? 1 : 0.5,
            debugMode: false,
            showLog: false,
            cameraResolution: "1280x720",

            captureSensibilityEnum: FPhi.SelphID.CaptureSensibility,
            captureModeEnum: FPhi.SelphID.Mode,

            isWidgetEnabled: false
        }
    },
    methods: {
        onModuleLoaded: function (event) {
            console.warn("[SelphID] onModuleLoaded", event);
        },

        onExtractionFinished: function (extractionResult) {
            console.warn("[SelphID] onExtractionFinished", extractionResult);

            console.log("Images returned: ", extractionResult.detail.images);

            for (let i = 0; i < extractionResult.detail.images.length; i++) {
                const img = extractionResult.detail.images[i];
                console.log(`Image ${i}: ${img.src}`);
            }

            this.isWidgetEnabled = false;
            this.$emit('id-identified', extractionResult.detail.images)
        },

        onUserCancelled: function () {
            console.warn("[SelphID] onUserCancel");

            this.isWidgetEnabled = false;
        },

        onExceptionCaptured: function (exceptionResult) {
            console.warn("[SelphID] onExceptionCaptured", exceptionResult);
            console.log(`exceptionType: ${exceptionResult.detail.exceptionType}`);
            console.log(`exceptionMessage: ${exceptionResult.detail.message}`);

            this.isWidgetEnabled = false;
        },

        onExtractionTimeout: function (event) {
            console.warn("[SelphID] onExtractionTimeout", event);

            this.isWidgetEnabled = false;
        },

        onTrackStatus: function (event) {
            let trackStatusCode = Object.entries(FPhi.SelphID.TrackStatus).find(e => e[1] === event.detail.code);
            console.warn(`[SelphID] onTrackStatus (Code: ${trackStatusCode[1]} - ${trackStatusCode[0]}, Timestamp: ${event.detail.timeStamp}`);
            console.log(event);
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
            this.isWidgetEnabled = false;
        },

        enableWidget: function () {
            this.isWidgetEnabled = true;
        }
    }
}
</script>

<style>

</style>