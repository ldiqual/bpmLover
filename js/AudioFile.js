var AudioFile = function( file ){
    this._file = file;
    this._audioBuffer = null;
    this._audioData = null;
};

AudioFile.audioContext = null;

/**
 * Load a file as an ArrayBuffer
 * 
 * @param  {Function}         onDone
 *         {ArrayBuffer|null} onDone.arrayBuffer
 */
AudioFile.prototype.getArrayBuffer = function( onDone ){
    var reader = new FileReader();
    reader.onload = function(){
        onDone( reader.result );
    };
    reader.onError = function(){
        onDone( null );
    };
    reader.readAsArrayBuffer( this._file );
};


/**
 * Extracts audio from an ArrayBuffer. Calls a callback
 * when processing is done, with an AudioBuffer as first and
 * only parameter.
 * 
 * @param  {Function}         callback
 *         {AudioBuffer|null} callback.audioBuffer
 */
AudioFile.prototype.getAudioBuffer = function( callback ){
    if( this._audioBuffer ){
        callback( this._audioBuffer );
        return;
    }

    var _this = this;
    this.getArrayBuffer( function( arrayBuffer ){
        if( !arrayBuffer ){
            callback( null );
            return;
        }
        
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        AudioFile.audioContext = AudioFile.audioContext || new AudioContext();
        AudioFile.audioContext.decodeAudioData( arrayBuffer, function( audioBuffer ){
            _this._audioBuffer = audioBuffer;
            callback( audioBuffer );
        }, function(){
            callback( null );
        });
    });    
};

/**
 * Extracts channels data from the audio buffer.
 * Averages stereo data.
 * 
 * @param  {Function}     callback
 *         {Float32Array} callback.data
 *         {Number}       callback.sampleRate
 */
AudioFile.prototype.getAudioData = function( callback ){

    if( this._audioData ){
        callback( this._audioData, this._audioBuffer.sampleRate );
        return;
    }

    this.getAudioBuffer( function( audioBuffer ){
        if( !audioBuffer ){
            callback( null );
            return;
        }

        if( audioBuffer.numberOfChannels == 0 ){
            callback( null );
            return;
        }

        var channelData = this._audioBuffer.getChannelData( 0 );

        // If there's two channels, take the average
        if( audioBuffer.numberOfChannels >= 2 ){
            var otherChannelData = audioBuffer.getChannelData( 1 );
            for( var sampleIndex = 0; sampleIndex < channelData.length; sampleIndex++ ){
                channelData[ sampleIndex ] = ( channelData[ sampleIndex ] + otherChannelData[ sampleIndex ] ) / 2;
            }
        }

        this._audioData = channelData;
        callback( channelData, audioBuffer.sampleRate );
    }.bind( this ));
};