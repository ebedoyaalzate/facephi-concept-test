import download from 'downloadjs'
import postmanBase from '../constants/postmanBase.json'

export const createJson = (faceData, idData) => {
  const evaluatePassiveLivenessBody = `{"imageBuffer": "${faceData.bestImageTokenized}"}`

  const images = idData.map((img) => img.src.replace('data:image/png;base64,', ''))

  const extractDocumentDataBody = `{"tokenFrontDocument" : "${images[0]}","tokenBackDocument": "${images[1]}","countryCode" : "COL"}`

  const authenticateFacialBody = `{"token1": "${images[0]}", "token2": "${faceData.templateRaw}","method": 3}`

  postmanBase.item[0].request.body.raw = authenticateFacialBody
  postmanBase.item[1].request.body.raw = extractDocumentDataBody
  postmanBase.item[2].request.body.raw = evaluatePassiveLivenessBody

  download(JSON.stringify(postmanBase), "postmanTest.json", "text/plain");
}