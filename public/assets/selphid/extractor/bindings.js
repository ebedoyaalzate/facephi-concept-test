/**
 * Bindings for web assembly module
 */
class documentExtractor {
    constructor(outputData, qualityThreshold, edgeOffset) {

        let options = new Module.DocumentExtractionOptions();
        options.setQualityThreshold(qualityThreshold); // 60.0 default
        options.setEdgeOffset(edgeOffset); // 10 default

        this.detector = new Module.DocumentExtractor(options);
        //this.output = Module.matFromArray(outputData, 24);
        this.width = null;
        this.height = null;
    }

    setEdgeOffset(eo) {
        this.detector.setEdgeOffset(eo);
    }
    
    setQualityThreshold(qt) {
        this.detector.setQualityThreshold(qt);
    }
    
  /**
   * @param imageData imageData from input canvas element
   * @param outputData outputData from output canvas element
   * @return docContour vector or points with card detected
   */
  detectCard(imageData, outputData, width, height, roiWidth, roiHeight) {
    
      /*if ((this.width==null) && (this.height==null)) {
          this.width = width;
          this.height = height;
      }
      
      if ((this.width != width) || (this.height != height)) {
          console.log("Critical error: incoherent document dimensions...");
          return {show: false, edges: [false,false,false,false]};
      }*/
      
    let img = Module.matFromArray(imageData, 24);
    let contour = [];
    let edges = [];
    let showDocCaptured = true
    
    try {
      
        let results = this.detector.detectNextNoOutput(img, width, height, roiWidth, roiHeight);
        //let results = this.detector.detectNext(img, this.output, width, height, roiWidth, roiHeight);
        let docContour = results.getDocumentLocation();
        
        let edgesDetected = results.getEdgesDetected();
        
        for (let i = 0; i < edgesDetected.size(); i++) {
          edges[i] = edgesDetected.get(i);
        }
        
        //console.log(edges);
        
        for (let i = 0; i < docContour.size(); i++) {
          contour[i] = docContour.get(i);
        }

        //console.log(contour);
        
        if (docContour.size() == 1) showDocCaptured = false;
        else {
          for (let i = 0; i < docContour.size(); i++) {
            for (let n = 0; n < 2; n++) {
              if(contour[i][n] < 0) {
                showDocCaptured = false;
                break;
              }
            }
          }
        }    
        /*
        if (showDocCaptured) {
          outputData = this.mat2imgData(this.output);
        }*/
        
    } catch(e) {
      console.log(imageData,width,height,roiWidth,roiHeight);
      console.log(e);
    }

    img.delete();
      return {cnt: contour, out: outputData, show: showDocCaptured, edges: edges };
  }
  
  mat2imgData(/*canvasSource,*/mat) {
    /*
    let canvas = null;
    if (typeof canvasSource === 'string') {
        canvas = document.getElementById(canvasSource);
    } else {
        canvas = canvasSource;
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Please input the valid canvas element or id.');
        return;
    }*/
    if (!(mat instanceof Module.Mat)) {
        throw new Error('Please input the valid Module.Mat instance.');
        return;
    }

    // convert the mat type to Module.CV_8U
    let img = new Module.Mat();
    let depth = mat.type()%8;
    let scale = depth <= Module.CV_8S? 1.0 : (depth <= Module.CV_32S? 1.0/256.0 : 255.0);
    let shift = (depth === Module.CV_8S || depth === Module.CV_16S)? 128.0 : 0.0;
    mat.convertTo(img, Module.CV_8U, scale, shift);

    // convert the img type to Module.CV_8UC4
    switch (img.type()) {
        case Module.CV_8UC1:
            Module.cvtColor(img, img, Module.COLOR_GRAY2RGBA);
            break;
        case Module.CV_8UC3:
            Module.cvtColor(img, img, Module.COLOR_RGB2RGBA);
            break;
        case Module.CV_8UC4:
            break;
        default:
            throw new Error('Bad number of channels (Source image must have 1, 3 or 4 channels)');
            return;
    }
    
    
    let imgData = new ImageData(new Uint8ClampedArray(img.data()), img.cols, img.rows);
    //let ctx = canvas.getContext('2d');
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //canvas.width = imgData.width;
    //canvas.height = imgData.height;
    //ctx.putImageData(imgData, 0, 0);
    img.delete();
    //console.log(imgData);
    return imgData;
};

  /*
  mallocVect(data) {
    let y = new Module.VectorInt();
    for (let i = 0; i < data.length; i++) {
      y.push_back(data[i]);
    }

    return y;
  }

  freeVect(y) {
    Module._free(y);
  }*/
}
