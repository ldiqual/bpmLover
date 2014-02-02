#!/bin/bash
closure-compiler js/AudioFile.js js/TapCounter.js js/App.js > js/packed/app.js
closure-compiler js/dsp.js js/beatdetektor.js js/BPMWorker.js > js/packed/worker.js