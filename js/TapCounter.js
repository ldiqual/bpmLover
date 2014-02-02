var TapCounter = function(){
    this.reset();
};

TapCounter.prototype.reset = function(){
    this._tapCount   = 0;
    this._tapTimestamps = [];
    this._tapBPM = 0;
};

TapCounter.prototype.tap = function(){
    this._tapCount   = 0;

    this._tapTimestamps.push( new Date().getTime() );
    
    var intervalSum = 0;
    _.each( this._tapTimestamps, function( timestamp, index ){
        if( index == 0 ){
            return;
        }
        intervalSum += timestamp - this._tapTimestamps[ index - 1 ];
    }.bind( this ));

    if( intervalSum == 0 ){
        this._tapBPM = 0;
    }
    else {   
        var intervalAverage = ( intervalSum / this._tapTimestamps.length ) / 1000;
        this._tapBPM = ( 1 / intervalAverage ) * 60;
    }
};

TapCounter.prototype.getBPM = function(){
    return this._tapBPM;
};
