// In production mode, dsp.js & beatdetektor are packed with BPMWorker.js
var isPacked = this.FFT && this.BeatDetektor;
if( !isPacked ){
    importScripts( 'dsp.js', 'beatdetektor.js' );
}

var BPMWorker = function(){
};

BPMWorker.AMPLITUDE_THRESHOLD = 0.45;
BPMWorker.FRAME_LENGTH        = 512;

/**
 * Extracts the BPM of a song.
 * 
 * @param  {Float32Array} channelData
 * @param  {Number}       sampleRate
 * @param  {Function}     onDone
 *         {Number}       onDone.bpm
 * @param  {Number}       onProgress
 *         {Number}       onProgress.percentage
 */
BPMWorker.prototype.getBPM = function( channelData, sampleRate, onDone, onProgress ){

    var beatDetektor = new BeatDetektor( 65, 180 );
    var frame, fft, elapsedTime;

    for( var frameStart = 0; frameStart + BPMWorker.FRAME_LENGTH < channelData.length; frameStart += BPMWorker.FRAME_LENGTH ){
        onProgress( 100 * ( frameStart / channelData.length ) );
        frame = channelData.subarray( frameStart, frameStart + BPMWorker.FRAME_LENGTH );
        fft = new FFT( BPMWorker.FRAME_LENGTH, frame );
        fft.forward( frame );
        elapsedTime = ( frameStart + BPMWorker.FRAME_LENGTH ) / sampleRate;
        beatDetektor.process( elapsedTime, fft.spectrum );
    }

    var bpm = beatDetektor.win_bpm_int / 10;
    onDone( bpm );
};

BPMWorker.prototype.notifyBPM = function( bpm ){
    postMessage({
        type: 'bpmResult',
        bpm: bpm
    });
};

BPMWorker.prototype.notifyProgress = function( progress ){
    postMessage({
        type: 'progress',
        progress: progress
    });
};

var bpm = new BPMWorker();

onmessage = function( messageEvent ){
    var messageData = messageEvent.data;

    if( messageData.type != 'command' ){
        console.log( 'Invalid messageData.type: '+ messageData.type );
        return;
    }

    if( messageData.commandType == 'getBPM' ){
        bpm.getBPM( messageData.channelData, messageData.sampleRate, bpm.notifyBPM.bind( bpm ), bpm.notifyProgress.bind( bpm ) );
    }
};
