<script>
import FaceIdentifier from './components/FaceIdentifier';
import IdIdentifier from './components/IdIdentifier';
import { createJson } from './services/jsonCreate'

export default {
	name: 'App',
	components: { FaceIdentifier, IdIdentifier },
	data: function () {
		return {
			faceIdentified: false,
      faceData: null,
      idData: null
		}
	},
  methods: {
    onFaceExtract(event) {
      console.log('from app face', event.detail)
      this.faceIdentified = true
      this.faceData = event.detail
    },
    onIdExtract(event) {
      console.log('from app', event)
      this.idData = event
      this.generateJson()
    },
    generateJson() {
      createJson(this.faceData, this.idData)
    }
  }
}
</script>

<style>
#app {
	width: 100vw;
	height: 100vh;
}

html, body {
	height: 100%;
}

.min-h-100 {
  min-height: 100% !important;
}
</style>

<template>
  <header class="bg-dark">
    <div class="container p-3 d-flex align-items-center justify-content-between">
      <img src="assets/img/logo_selphi.svg" alt="Selphi" height="42"/>
      <a href="https://www.facephi.com/" title="FacePhi" target="_blank">
      <img src="assets/img/logo_FacePhi.svg" alt="FacePhi"/></a>
    </div>
  </header>

  <main class="flex-grow-1 d-flex align-items-stretch">
    <face-identifier v-if="!faceIdentified" @face-identified="onFaceExtract"></face-identifier>
    <id-identifier v-if="faceIdentified" @id-identified="onIdExtract"></id-identifier>
  </main>

  <footer class="bg-dark text-white">
    <div class="container px-3 d-flex justify-content-between align-items-center">
      <small>2021 ©FacePhi. All rights reserved.</small>
      <div class="small font-weight-bold px-3 py-2 bg-success">Vue.js</div>
    </div>
  </footer>
</template>
