var App = function(){
    this._$progressBarContainer = $( '.progress' );
    this._$progressBar          = $( '.progress-bar' );
    this._$result               = $( '.result-box .result' );
    this._$fileSelector         = $( '.file-selector' );
    this._$tapButton            = $( '.tap-button' );

    this._tapCounter = new TapCounter();

    this.initJumbotron();

    this.setActionBoxState( App.ACTION_BOX_STATE_IDLE );

    var bpmWorker = new Worker( DEBUG ? 'js/BPMWorker.js' : 'js/packed/worker.js' );

    bpmWorker.onmessage = function( messageEvent ){
        if( messageEvent.data.type == 'bpmResult' ){
            this.updateProgressBar( 100 );
            this.showResult( messageEvent.data.bpm );
        }
        else if( messageEvent.data.type == 'progress' ){
            this.updateProgressBar( messageEvent.data.progress );
        }
    }.bind( this );

    var onAudioDataLoaded = function( channelsData, sampleRate ){
        bpmWorker.postMessage( {
            type:        'command',
            commandType: 'getBPM',
            channelData: channelsData,
            sampleRate:  sampleRate
        });
    };

    var initFileProcessUI = function(){
        this.setActionBoxState( App.ACTION_BOX_STATE_PROCESSING );
        this.updateProgressBar( 0 );
    }.bind( this );

    var onFileLoaded = function( file ){
        initFileProcessUI();
        this._tapCounter.reset();

        var audioFile = new AudioFile( file );
        audioFile.getAudioData( function( audioData, sampleRate ){
            if( !audioData ){
                this.setActionBoxState( App.ACTION_BOX_STATE_LOAD_ERROR );
                return;
            }
            onAudioDataLoaded( audioData, sampleRate  );
        }.bind( this ));
    }.bind( this );

    var fileInput = document.querySelector( '[type="file"]' );
    fileInput.addEventListener( 'change', function( ev ){
        var file = fileInput.files[ 0 ];
        if( file ){
            onFileLoaded( file );
        }
    });

    this._$fileSelector.click( function(){
        fileInput.value = '';
        fileInput.click();
    });

    this._$tapButton.click( function(){
        this._tapCounter.tap();
        this.setActionBoxState( App.ACTION_BOX_STATE_TAPPING );
        this.updateBPM( this._tapCounter.getBPM() );    
    }.bind( this ));
};

App.FILE_SELECTOR_CLASSES_TO_REMOVE = 'btn-primary btn-default btn-danger';

App.ACTION_BOX_STATE_IDLE       = 'IDLE';
App.ACTION_BOX_STATE_PROCESSING = 'PROCESSING';
App.ACTION_BOX_STATE_TAPPING    = 'TAPPING';
App.ACTION_BOX_STATE_DONE       = 'DONE';

App.prototype.initJumbotron = function(){
    var jumbotron = $( '.jumbotron' );
    var adjustJumbotronMargin = function(){
        var marginTop = Math.round( ( $( window ).height() - jumbotron.outerHeight() ) / 2 );
        jumbotron.get( 0 ).style.setProperty( 'margin-top', marginTop +'px', 'important' );
    }
    $( window ).resize( adjustJumbotronMargin );
    adjustJumbotronMargin();    
};

App.prototype.setActionBoxState = function( state ){

    var updateFileSelector = function( klass, text, disabled ){
        this._$fileSelector
            .removeClass( App.FILE_SELECTOR_CLASSES_TO_REMOVE )
            .addClass( klass )
            .text( text )
            .attr( 'disabled', disabled );
        return this._$fileSelector;
    }.bind( this );

    switch( state ){
        case App.ACTION_BOX_STATE_IDLE:
            updateFileSelector( 'btn-primary', 'Select a song', false );
            this._$progressBarContainer.hide();
            this._$result.hide();
            this._$tapButton.attr( 'disabled', false );
            break;
        case App.ACTION_BOX_STATE_LOAD_ERROR:
            updateFileSelector( 'btn-danger', "Can't load audio file", false );
            this._$progressBarContainer.hide();
            this._$result.hide();
            this._$tapButton.attr( 'disabled', true );
            break;
        case App.ACTION_BOX_STATE_PROCESSING:
            updateFileSelector( 'btn-default', 'Processing...', true );
            this._$progressBarContainer.show();
            this._$result.hide();
            this._$tapButton.attr( 'disabled', true );
            break;
        case App.ACTION_BOX_STATE_TAPPING:
            this._$result.show();
            updateFileSelector( 'btn-primary', 'Select a song', false );
            this._$progressBarContainer.hide();
            this._$tapButton.attr( 'disabled', false );
            break;
        case App.ACTION_BOX_STATE_DONE:
            updateFileSelector( 'btn-primary', 'Select a song', false );
            this._$progressBarContainer.hide();
            this._$result.show();
            this._$tapButton.attr( 'disabled', false );
            break;
    }
};

App.prototype.updateProgressBar = function( progress ){
    this._$progressBar.width( progress +'%' );
};

App.prototype.updateBPM = function( bpm ){
    this._$result.text( bpm.toFixed( 1 ) + ' BPM' );
};

App.prototype.showResult = function( bpm ){
    this.updateBPM( bpm );
    this.setActionBoxState( App.ACTION_BOX_STATE_DONE );
};
