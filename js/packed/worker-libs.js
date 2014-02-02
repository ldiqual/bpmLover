var DSP={LEFT:0,RIGHT:1,MIX:2,SINE:1,TRIANGLE:2,SAW:3,SQUARE:4,LOWPASS:0,HIGHPASS:1,BANDPASS:2,NOTCH:3,BARTLETT:1,BARTLETTHANN:2,BLACKMAN:3,COSINE:4,GAUSS:5,HAMMING:6,HANN:7,LANCZOS:8,RECTANGULAR:9,TRIANGULAR:10,OFF:0,FW:1,BW:2,FWBW:3,TWO_PI:2*Math.PI};function setupTypedArray(a,d){"function"!==typeof this[a]&&"object"!==typeof this[a]&&(this[a]="function"===typeof this[d]&&"object"!==typeof this[d]?this[d]:function(a){if(a instanceof Array)return a;if("number"===typeof a)return Array(a)})}
setupTypedArray("Float32Array","WebGLFloatArray");setupTypedArray("Int32Array","WebGLIntArray");setupTypedArray("Uint16Array","WebGLUnsignedShortArray");setupTypedArray("Uint8Array","WebGLUnsignedByteArray");DSP.invert=function(a){for(var d=0,b=a.length;d<b;d++)a[d]*=-1;return a};DSP.interleave=function(a,d){if(a.length!==d.length)throw"Can not interleave. Channel lengths differ.";for(var b=new Float32Array(2*a.length),c=0,f=a.length;c<f;c++)b[2*c]=a[c],b[2*c+1]=d[c];return b};
DSP.deinterleave=function(){var a,d,b,c=[];c[DSP.MIX]=function(a){for(var c=0,d=a.length/2;c<d;c++)b[c]=(a[2*c]+a[2*c+1])/2;return b};c[DSP.LEFT]=function(b){for(var c=0,d=b.length/2;c<d;c++)a[c]=b[2*c];return a};c[DSP.RIGHT]=function(a){for(var b=0,c=a.length/2;b<c;b++)d[b]=a[2*b+1];return d};return function(f,g){a=a||new Float32Array(g.length/2);d=d||new Float32Array(g.length/2);b=b||new Float32Array(g.length/2);g.length/2!==a.length&&(a=new Float32Array(g.length/2),d=new Float32Array(g.length/
2),b=new Float32Array(g.length/2));return c[f](g)}}();DSP.getChannel=DSP.deinterleave;DSP.mixSampleBuffers=function(a,d,b,c){for(var f=new Float32Array(a),g=0;g<a.length;g++)f[g]+=(b?-d[g]:d[g])/c;return f};DSP.LPF=0;DSP.HPF=1;DSP.BPF_CONSTANT_SKIRT=2;DSP.BPF_CONSTANT_PEAK=3;DSP.NOTCH=4;DSP.APF=5;DSP.PEAKING_EQ=6;DSP.LOW_SHELF=7;DSP.HIGH_SHELF=8;DSP.Q=1;DSP.BW=2;DSP.S=3;DSP.RMS=function(a){for(var d=0,b=0,c=a.length;b<c;b++)d+=a[b]*a[b];return Math.sqrt(d/c)};
DSP.Peak=function(a){for(var d=0,b=0,c=a.length;b<c;b++)d=Math.abs(a[b])>d?Math.abs(a[b]):d;return d};
function FourierTransform(a,d){this.bufferSize=a;this.sampleRate=d;this.bandwidth=2/a*d/2;this.spectrum=new Float32Array(a/2);this.real=new Float32Array(a);this.imag=new Float32Array(a);this.peak=this.peakBand=0;this.getBandFrequency=function(a){return this.bandwidth*a+this.bandwidth/2};this.calculateSpectrum=function(){for(var b=this.spectrum,c=this.real,d=this.imag,g=2/this.bufferSize,h=Math.sqrt,p,e,m=0,q=a/2;m<q;m++)p=c[m],e=d[m],p=g*h(p*p+e*e),p>this.peak&&(this.peakBand=m,this.peak=p),b[m]=
p}}function DFT(a,d){FourierTransform.call(this,a,d);var b=a/2*a,c=2*Math.PI;this.sinTable=new Float32Array(b);this.cosTable=new Float32Array(b);for(var f=0;f<b;f++)this.sinTable[f]=Math.sin(f*c/a),this.cosTable[f]=Math.cos(f*c/a)}DFT.prototype.forward=function(a){for(var d=this.real,b=this.imag,c,f,g=0;g<this.bufferSize/2;g++){for(var h=f=c=0;h<a.length;h++)c+=this.cosTable[g*h]*a[h],f+=this.sinTable[g*h]*a[h];d[g]=c;b[g]=f}return this.calculateSpectrum()};
function FFT(a,d){FourierTransform.call(this,a,d);this.reverseTable=new Uint32Array(a);for(var b=1,c=a>>1,f;b<a;){for(f=0;f<b;f++)this.reverseTable[f+b]=this.reverseTable[f]+c;b<<=1;c>>=1}this.sinTable=new Float32Array(a);this.cosTable=new Float32Array(a);for(f=0;f<a;f++)this.sinTable[f]=Math.sin(-Math.PI/f),this.cosTable[f]=Math.cos(-Math.PI/f)}
FFT.prototype.forward=function(a){var d=this.bufferSize,b=this.cosTable,c=this.sinTable,f=this.reverseTable,g=this.real,h=this.imag,p=Math.floor(Math.log(d)/Math.LN2);if(Math.pow(2,p)!==d)throw"Invalid buffer size, must be a power of 2.";if(d!==a.length)throw"Supplied buffer is not the same size as defined FFT. FFT Size: "+d+" Buffer Size: "+a.length;var p=1,e,m,q,k,n,l;for(l=0;l<d;l++)g[l]=a[f[l]],h[l]=0;for(;p<d;){a=b[p];f=c[p];e=1;for(var w=m=0;w<p;w++){for(l=w;l<d;)q=l+p,k=e*g[q]-m*h[q],n=e*h[q]+
m*g[q],g[q]=g[l]-k,h[q]=h[l]-n,g[l]+=k,h[l]+=n,l+=p<<1;l=e;e=l*a-m*f;m=l*f+m*a}p<<=1}return this.calculateSpectrum()};
FFT.prototype.inverse=function(a,d){var b=this.bufferSize,c=this.cosTable,f=this.sinTable,g=this.reverseTable;a=a||this.real;d=d||this.imag;var h=1,p,e,m,q,k,n,l;for(l=0;l<b;l++)d[l]*=-1;p=new Float32Array(b);e=new Float32Array(b);for(l=0;l<a.length;l++)p[l]=a[g[l]],e[l]=d[g[l]];a=p;for(d=e;h<b;){g=c[h];p=f[h];e=1;for(var w=m=0;w<h;w++){for(l=w;l<b;)q=l+h,k=e*a[q]-m*d[q],n=e*d[q]+m*a[q],a[q]=a[l]-k,d[q]=d[l]-n,a[l]+=k,d[l]+=n,l+=h<<1;l=e;e=l*g-m*p;m=l*p+m*g}h<<=1}c=new Float32Array(b);for(l=0;l<b;l++)c[l]=
a[l]/b;return c};
function RFFT(a,d){FourierTransform.call(this,a,d);this.trans=new Float32Array(a);this.reverseTable=new Uint32Array(a);this.reverseBinPermute=function(a,c){var d=this.bufferSize,g=d>>>1,d=d-1,h=1,p=0,e;a[0]=c[0];do{p+=g;a[h]=c[p];a[p]=c[h];h++;for(e=g<<1;e>>=1,!((p^=e)&e););p>=h&&(a[h]=c[p],a[p]=c[h],a[d-h]=c[d-p],a[d-p]=c[d-h]);h++}while(h<g);a[d]=c[d]};this.generateReverseTable=function(){var a=this.bufferSize,c=a>>>1,a=a-1,d=1,g=0,h;this.reverseTable[0]=0;do{g+=c;this.reverseTable[d]=g;this.reverseTable[g]=
d;d++;for(h=c<<1;h>>=1,!((g^=h)&h););g>=d&&(this.reverseTable[d]=g,this.reverseTable[g]=d,this.reverseTable[a-d]=a-g,this.reverseTable[a-g]=a-d);d++}while(d<c);this.reverseTable[a]=a};this.generateReverseTable()}
RFFT.prototype.forward=function(a){var d=this.bufferSize,b=this.spectrum,c=this.trans,f=2*Math.PI,g=Math.sqrt,h=d>>>1,p=2/d,e,m,q,k,n,l,w,s,x,t,u,B,C,D,F,y,z,A,G,H,I;this.reverseBinPermute(c,a);k=0;for(var v=4;k<d;v*=4){for(var r=k;r<d;r+=v)y=c[r]-c[r+1],c[r]+=c[r+1],c[r+1]=y;k=2*(v-1)}a=2;for(q=d>>>1;q>>>=1;){k=0;a<<=1;v=a<<1;e=a>>>2;m=a>>>3;do{if(1!==e)for(r=k;r<d;r+=v)s=r,x=s+e,t=x+e,u=t+e,k=c[t]+c[u],c[u]-=c[t],c[t]=c[s]-k,c[s]+=k,s+=m,x+=m,t+=m,u+=m,k=c[t]+c[u],n=c[t]-c[u],k=-k*Math.SQRT1_2,
n*=Math.SQRT1_2,y=c[x],c[u]=k+y,c[t]=k-y,c[x]=c[s]-n,c[s]+=n;else for(r=k;r<d;r+=v)s=r,x=s+e,t=x+e,u=t+e,k=c[t]+c[u],c[u]-=c[t],c[t]=c[s]-k,c[s]+=k;k=(v<<1)-a;v<<=2}while(k<d);I=f/a;for(var E=1;E<m;E++){z=E*I;A=Math.sin(z);z=Math.cos(z);G=4*z*(z*z-0.75);H=4*A*(0.75-A*A);k=0;v=a<<1;do{for(r=k;r<d;r+=v)s=r+E,x=s+e,t=x+e,u=t+e,B=r+e-E,C=B+e,D=C+e,F=D+e,n=c[D]*z-c[t]*A,k=c[D]*A+c[t]*z,w=c[F]*G-c[u]*H,l=c[F]*H+c[u]*G,y=n-w,n+=w,w=y,c[F]=n+c[C],c[t]=n-c[C],y=l-k,k+=l,l=y,c[u]=l+c[x],c[D]=l-c[x],c[C]=c[s]-
k,c[s]+=k,c[x]=w+c[B],c[B]-=w;k=(v<<1)-a;v<<=2}while(k<d)}}for(;--h;)f=c[h],a=c[d-h-1],f=p*g(f*f+a*a),f>this.peak&&(this.peakBand=h,this.peak=f),b[h]=f;b[0]=p*c[0];return b};
function Sampler(a,d,b,c,f,g,h,p){this.file=a;this.bufferSize=d;this.sampleRate=b;this.playStart=c||0;this.playEnd=f||1;this.loopStart=g||0;this.loopEnd=h||1;this.loopMode=p||DSP.OFF;this.loaded=!1;this.samples=[];this.signal=new Float32Array(d);this.frameCount=0;this.envelope=null;this.amplitude=1;this.rootFrequency=110;this.frequency=550;this.step=this.frequency/this.rootFrequency;this.playhead=this.samplesProcessed=this.duration=0;var e=document.createElement("AUDIO"),m=this;this.loadSamples=function(a){a=
DSP.getChannel(DSP.MIX,a.frameBuffer);for(var b=0;b<a.length;b++)m.samples.push(a[b])};this.loadComplete=function(){m.samples=new Float32Array(m.samples);m.loaded=!0};this.loadMetaData=function(){m.duration=e.duration};e.addEventListener("MozAudioAvailable",this.loadSamples,!1);e.addEventListener("loadedmetadata",this.loadMetaData,!1);e.addEventListener("ended",this.loadComplete,!1);e.muted=!0;e.src=a;e.play()}Sampler.prototype.applyEnvelope=function(){this.envelope.process(this.signal);return this.signal};
Sampler.prototype.generate=function(){for(var a=this.playEnd*this.samples.length-this.playStart*this.samples.length,d=this.playStart*this.samples.length,b=this.playEnd*this.samples.length,c=0;c<this.bufferSize;c++){switch(this.loopMode){case DSP.OFF:this.playhead=Math.round(this.samplesProcessed*this.step+d);this.signal[c]=this.playhead<this.playEnd*this.samples.length?this.samples[this.playhead]*this.amplitude:0;break;case DSP.FW:this.playhead=Math.round(this.samplesProcessed*this.step%a+d);this.playhead<
this.playEnd*this.samples.length&&(this.signal[c]=this.samples[this.playhead]*this.amplitude);break;case DSP.BW:this.playhead=b-Math.round(this.samplesProcessed*this.step%a);this.playhead<this.playEnd*this.samples.length&&(this.signal[c]=this.samples[this.playhead]*this.amplitude);break;case DSP.FWBW:this.playhead=0===Math.floor(this.samplesProcessed*this.step/a)%2?Math.round(this.samplesProcessed*this.step%a+d):b-Math.round(this.samplesProcessed*this.step%a),this.playhead<this.playEnd*this.samples.length&&
(this.signal[c]=this.samples[this.playhead]*this.amplitude)}this.samplesProcessed++}this.frameCount++;return this.signal};Sampler.prototype.setFreq=function(a){var d=this.samplesProcessed*this.step;this.frequency=a;this.step=this.frequency/this.rootFrequency;this.samplesProcessed=Math.round(d/this.step)};Sampler.prototype.reset=function(){this.playhead=this.samplesProcessed=0};
function Oscillator(a,d,b,c,f){this.frequency=d;this.amplitude=b;this.bufferSize=c;this.sampleRate=f;this.frameCount=0;this.waveTableLength=2048;this.cyclesPerSample=d/f;this.signal=new Float32Array(c);this.envelope=null;switch(parseInt(a,10)){case DSP.TRIANGLE:this.func=Oscillator.Triangle;break;case DSP.SAW:this.func=Oscillator.Saw;break;case DSP.SQUARE:this.func=Oscillator.Square;break;default:case DSP.SINE:this.func=Oscillator.Sine}this.generateWaveTable=function(){Oscillator.waveTable[this.func]=
new Float32Array(2048);for(var a=1/(this.waveTableLength/this.sampleRate),b=0;b<this.waveTableLength;b++)Oscillator.waveTable[this.func][b]=this.func(b*a/this.sampleRate)};"undefined"===typeof Oscillator.waveTable&&(Oscillator.waveTable={});"undefined"===typeof Oscillator.waveTable[this.func]&&this.generateWaveTable();this.waveTable=Oscillator.waveTable[this.func]}Oscillator.prototype.setAmp=function(a){if(0<=a&&1>=a)this.amplitude=a;else throw"Amplitude out of range (0..1).";};
Oscillator.prototype.setFreq=function(a){this.frequency=a;this.cyclesPerSample=a/this.sampleRate};Oscillator.prototype.add=function(a){for(var d=0;d<this.bufferSize;d++)this.signal[d]+=a.signal[d];return this.signal};Oscillator.prototype.addSignal=function(a){for(var d=0;d<a.length&&!(d>=this.bufferSize);d++)this.signal[d]+=a[d];return this.signal};Oscillator.prototype.addEnvelope=function(a){this.envelope=a};Oscillator.prototype.applyEnvelope=function(){this.envelope.process(this.signal)};
Oscillator.prototype.valueAt=function(a){return this.waveTable[a%this.waveTableLength]};Oscillator.prototype.generate=function(){for(var a=this.frameCount*this.bufferSize,d=this.waveTableLength*this.frequency/this.sampleRate,b,c=0;c<this.bufferSize;c++)b=Math.round((a+c)*d),this.signal[c]=this.waveTable[b%this.waveTableLength]*this.amplitude;this.frameCount++;return this.signal};Oscillator.Sine=function(a){return Math.sin(DSP.TWO_PI*a)};Oscillator.Square=function(a){return 0.5>a?1:-1};
Oscillator.Saw=function(a){return 2*(a-Math.round(a))};Oscillator.Triangle=function(a){return 1-4*Math.abs(Math.round(a)-a)};Oscillator.Pulse=function(a){};
function ADSR(a,d,b,c,f,g){this.sampleRate=g;this.attackLength=a;this.decayLength=d;this.sustainLevel=b;this.sustainLength=c;this.releaseLength=f;this.sampleRate=g;this.attackSamples=a*g;this.decaySamples=d*g;this.sustainSamples=c*g;this.releaseSamples=f*g;this.update=function(){this.attack=this.attackSamples;this.decay=this.attack+this.decaySamples;this.sustain=this.decay+this.sustainSamples;this.release=this.sustain+this.releaseSamples};this.update();this.samplesProcessed=0}
ADSR.prototype.noteOn=function(){this.samplesProcessed=0;this.sustainSamples=this.sustainLength*this.sampleRate;this.update()};ADSR.prototype.noteOff=function(){this.sustainSamples=this.samplesProcessed-this.decaySamples;this.update()};
ADSR.prototype.processSample=function(a){var d=0;this.samplesProcessed<=this.attack?d=0+1*((this.samplesProcessed-0)/(this.attack-0)):this.samplesProcessed>this.attack&&this.samplesProcessed<=this.decay?d=1+(this.sustainLevel-1)*((this.samplesProcessed-this.attack)/(this.decay-this.attack)):this.samplesProcessed>this.decay&&this.samplesProcessed<=this.sustain?d=this.sustainLevel:this.samplesProcessed>this.sustain&&this.samplesProcessed<=this.release&&(d=this.sustainLevel+(0-this.sustainLevel)*((this.samplesProcessed-
this.sustain)/(this.release-this.sustain)));return a*d};
ADSR.prototype.value=function(){var a=0;this.samplesProcessed<=this.attack?a=0+1*((this.samplesProcessed-0)/(this.attack-0)):this.samplesProcessed>this.attack&&this.samplesProcessed<=this.decay?a=1+(this.sustainLevel-1)*((this.samplesProcessed-this.attack)/(this.decay-this.attack)):this.samplesProcessed>this.decay&&this.samplesProcessed<=this.sustain?a=this.sustainLevel:this.samplesProcessed>this.sustain&&this.samplesProcessed<=this.release&&(a=this.sustainLevel+(0-this.sustainLevel)*((this.samplesProcessed-
this.sustain)/(this.release-this.sustain)));return a};ADSR.prototype.process=function(a){for(var d=0;d<a.length;d++)a[d]*=this.value(),this.samplesProcessed++;return a};ADSR.prototype.isActive=function(){return this.samplesProcessed>this.release||-1===this.samplesProcessed?!1:!0};ADSR.prototype.disable=function(){this.samplesProcessed=-1};function IIRFilter(a,d,b,c){this.sampleRate=c;switch(a){case DSP.LOWPASS:case DSP.LP12:this.func=new IIRFilter.LP12(d,b,c)}}
IIRFilter.prototype.__defineGetter__("cutoff",function(){return this.func.cutoff});IIRFilter.prototype.__defineGetter__("resonance",function(){return this.func.resonance});IIRFilter.prototype.set=function(a,d){this.func.calcCoeff(a,d)};IIRFilter.prototype.process=function(a){this.func.process(a)};IIRFilter.prototype.addEnvelope=function(a){if(a instanceof ADSR)this.func.addEnvelope(a);else throw"Not an envelope.";};
IIRFilter.LP12=function(a,d,b){this.sampleRate=b;this.vibraSpeed=this.vibraPos=0;this.envelope=!1;this.calcCoeff=function(a,b){this.w=2*Math.PI*a/this.sampleRate;this.q=1-this.w/(2*(b+0.5/(1+this.w))+this.w-2);this.r=this.q*this.q;this.c=this.r+1-2*Math.cos(this.w)*this.q;this.cutoff=a;this.resonance=b};this.calcCoeff(a,d);this.process=function(a){for(var b=0;b<a.length;b++)this.vibraSpeed+=(a[b]-this.vibraPos)*this.c,this.vibraPos+=this.vibraSpeed,this.vibraSpeed*=this.r,this.envelope?(a[b]=a[b]*
(1-this.envelope.value())+this.vibraPos*this.envelope.value(),this.envelope.samplesProcessed++):a[b]=this.vibraPos}};IIRFilter.LP12.prototype.addEnvelope=function(a){this.envelope=a};
function IIRFilter2(a,d,b,c){this.type=a;this.cutoff=d;this.resonance=b;this.sampleRate=c;this.f=Float32Array(4);this.f[0]=0;this.f[1]=0;this.f[2]=0;this.f[3]=0;this.calcCoeff=function(a,b){this.freq=2*Math.sin(Math.PI*Math.min(0.25,a/(2*this.sampleRate)));this.damp=Math.min(2*(1-Math.pow(b,0.25)),Math.min(2,2/this.freq-0.5*this.freq))};this.calcCoeff(d,b)}
IIRFilter2.prototype.process=function(a){for(var d,b,c=this.f,f=0;f<a.length;f++)d=a[f],c[3]=d-this.damp*c[2],c[0]+=this.freq*c[2],c[1]=c[3]-c[0],c[2]=this.freq*c[1]+c[2],b=0.5*c[this.type],c[3]=d-this.damp*c[2],c[0]+=this.freq*c[2],c[1]=c[3]-c[0],c[2]=this.freq*c[1]+c[2],b+=0.5*c[this.type],this.envelope?(a[f]=a[f]*(1-this.envelope.value())+b*this.envelope.value(),this.envelope.samplesProcessed++):a[f]=b};
IIRFilter2.prototype.addEnvelope=function(a){if(a instanceof ADSR)this.envelope=a;else throw"This is not an envelope.";};IIRFilter2.prototype.set=function(a,d){this.calcCoeff(a,d)};
function WindowFunction(a,d){this.alpha=d;switch(a){case DSP.BARTLETT:this.func=WindowFunction.Bartlett;break;case DSP.BARTLETTHANN:this.func=WindowFunction.BartlettHann;break;case DSP.BLACKMAN:this.func=WindowFunction.Blackman;this.alpha=this.alpha||0.16;break;case DSP.COSINE:this.func=WindowFunction.Cosine;break;case DSP.GAUSS:this.func=WindowFunction.Gauss;this.alpha=this.alpha||0.25;break;case DSP.HAMMING:this.func=WindowFunction.Hamming;break;case DSP.HANN:this.func=WindowFunction.Hann;break;
case DSP.LANCZOS:this.func=WindowFunction.Lanczoz;break;case DSP.RECTANGULAR:this.func=WindowFunction.Rectangular;break;case DSP.TRIANGULAR:this.func=WindowFunction.Triangular}}WindowFunction.prototype.process=function(a){for(var d=a.length,b=0;b<d;b++)a[b]*=this.func(d,b,this.alpha);return a};WindowFunction.Bartlett=function(a,d){return 2/(a-1)*((a-1)/2-Math.abs(d-(a-1)/2))};WindowFunction.BartlettHann=function(a,d){return 0.62-0.48*Math.abs(d/(a-1)-0.5)-0.38*Math.cos(DSP.TWO_PI*d/(a-1))};
WindowFunction.Blackman=function(a,d,b){var c=b/2;return(1-b)/2-0.5*Math.cos(DSP.TWO_PI*d/(a-1))+c*Math.cos(4*Math.PI*d/(a-1))};WindowFunction.Cosine=function(a,d){return Math.cos(Math.PI*d/(a-1)-Math.PI/2)};WindowFunction.Gauss=function(a,d,b){return Math.pow(Math.E,-0.5*Math.pow((d-(a-1)/2)/(b*(a-1)/2),2))};WindowFunction.Hamming=function(a,d){return 0.54-0.46*Math.cos(DSP.TWO_PI*d/(a-1))};WindowFunction.Hann=function(a,d){return 0.5*(1-Math.cos(DSP.TWO_PI*d/(a-1)))};
WindowFunction.Lanczos=function(a,d){var b=2*d/(a-1)-1;return Math.sin(Math.PI*b)/(Math.PI*b)};WindowFunction.Rectangular=function(a,d){return 1};WindowFunction.Triangular=function(a,d){return 2/a*(a/2-Math.abs(d-(a-1)/2))};function sinh(a){return(Math.exp(a)-Math.exp(-a))/2}
function Biquad(a,d){this.Fs=d;this.type=a;this.parameterType=DSP.Q;this.y_2_r=this.y_1_r=this.x_2_r=this.x_1_r=this.y_2_l=this.y_1_l=this.x_2_l=this.x_1_l=0;this.a0=this.b0=1;this.a2=this.b2=this.a1=this.b1=0;this.b0a0=this.b0/this.a0;this.b1a0=this.b1/this.a0;this.b2a0=this.b2/this.a0;this.a1a0=this.a1/this.a0;this.a2a0=this.a2/this.a0;this.f0=3E3;this.dBgain=12;this.Q=1;this.BW=-3;this.S=1;this.coefficients=function(){return{b:[this.b0,this.b1,this.b2],a:[this.a0,this.a1,this.a2]}};this.setFilterType=
function(a){this.type=a;this.recalculateCoefficients()};this.setSampleRate=function(a){this.Fs=a;this.recalculateCoefficients()};this.setQ=function(a){this.parameterType=DSP.Q;this.Q=Math.max(Math.min(a,115),0.001);this.recalculateCoefficients()};this.setBW=function(a){this.parameterType=DSP.BW;this.BW=a;this.recalculateCoefficients()};this.setS=function(a){this.parameterType=DSP.S;this.S=Math.max(Math.min(a,5),1E-4);this.recalculateCoefficients()};this.setF0=function(a){this.f0=a;this.recalculateCoefficients()};
this.setDbGain=function(a){this.dBgain=a;this.recalculateCoefficients()};this.recalculateCoefficients=function(){var b;b=a===DSP.PEAKING_EQ||a===DSP.LOW_SHELF||a===DSP.HIGH_SHELF?Math.pow(10,this.dBgain/40):Math.sqrt(Math.pow(10,this.dBgain/20));var c=DSP.TWO_PI*this.f0/this.Fs,d=Math.cos(c),g=Math.sin(c),h=0;switch(this.parameterType){case DSP.Q:h=g/(2*this.Q);break;case DSP.BW:h=g*sinh(Math.LN2/2*this.BW*c/g);break;case DSP.S:h=g/2*Math.sqrt((b+1/b)*(1/this.S-1)+2)}switch(this.type){case DSP.LPF:this.b0=
(1-d)/2;this.b1=1-d;this.b2=(1-d)/2;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.HPF:this.b0=(1+d)/2;this.b1=-(1+d);this.b2=(1+d)/2;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.BPF_CONSTANT_SKIRT:this.b0=g/2;this.b1=0;this.b2=-g/2;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.BPF_CONSTANT_PEAK:this.b0=h;this.b1=0;this.b2=-h;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.NOTCH:this.b0=1;this.b1=-2*d;this.b2=1;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.APF:this.b0=
1-h;this.b1=-2*d;this.b2=1+h;this.a0=1+h;this.a1=-2*d;this.a2=1-h;break;case DSP.PEAKING_EQ:this.b0=1+h*b;this.b1=-2*d;this.b2=1-h*b;this.a0=1+h/b;this.a1=-2*d;this.a2=1-h/b;break;case DSP.LOW_SHELF:c=g*Math.sqrt((b^3)*(1/this.S-1)+2*b);this.b0=b*(b+1-(b-1)*d+c);this.b1=2*b*(b-1-(b+1)*d);this.b2=b*(b+1-(b-1)*d-c);this.a0=b+1+(b-1)*d+c;this.a1=-2*(b-1+(b+1)*d);this.a2=b+1+(b-1)*d-c;break;case DSP.HIGH_SHELF:c=g*Math.sqrt((b^3)*(1/this.S-1)+2*b),this.b0=b*(b+1+(b-1)*d+c),this.b1=-2*b*(b-1+(b+1)*d),
this.b2=b*(b+1+(b-1)*d-c),this.a0=b+1-(b-1)*d+c,this.a1=2*(b-1-(b+1)*d),this.a2=b+1-(b-1)*d-c}this.b0a0=this.b0/this.a0;this.b1a0=this.b1/this.a0;this.b2a0=this.b2/this.a0;this.a1a0=this.a1/this.a0;this.a2a0=this.a2/this.a0};this.process=function(a){for(var d=new Float32Array(a.length),f=0;f<a.length;f++)d[f]=this.b0a0*a[f]+this.b1a0*this.x_1_l+this.b2a0*this.x_2_l-this.a1a0*this.y_1_l-this.a2a0*this.y_2_l,this.y_2_l=this.y_1_l,this.y_1_l=d[f],this.x_2_l=this.x_1_l,this.x_1_l=a[f];return d};this.processStereo=
function(a){for(var d=a.length,f=new Float32Array(d),g=0;g<d/2;g++)f[2*g]=this.b0a0*a[2*g]+this.b1a0*this.x_1_l+this.b2a0*this.x_2_l-this.a1a0*this.y_1_l-this.a2a0*this.y_2_l,this.y_2_l=this.y_1_l,this.y_1_l=f[2*g],this.x_2_l=this.x_1_l,this.x_1_l=a[2*g],f[2*g+1]=this.b0a0*a[2*g+1]+this.b1a0*this.x_1_r+this.b2a0*this.x_2_r-this.a1a0*this.y_1_r-this.a2a0*this.y_2_r,this.y_2_r=this.y_1_r,this.y_1_r=f[2*g+1],this.x_2_r=this.x_1_r,this.x_1_r=a[2*g+1];return f}}
DSP.mag2db=function(a){for(var d=Math.pow(10,-6),b=Math.log,c=Math.max,f=Float32Array(a.length),g=0;g<a.length;g++)f[g]=20*b(c(a[g],d));return f};
DSP.freqz=function(a,d,b){var c,f;if(!b)for(b=Float32Array(200),c=0;c<b.length;c++)b[c]=DSP.TWO_PI/b.length*c-Math.PI;var g=Float32Array(b.length),h=Math.sqrt,p=Math.cos,e=Math.sin;for(c=0;c<b.length;c++){var m=0,q=0;for(f=0;f<a.length;f++)m+=a[f]*p(-f*b[c]),q+=a[f]*e(-f*b[c]);var k=0,n=0;for(f=0;f<d.length;f++)k+=d[f]*p(-f*b[c]),n+=d[f]*e(-f*b[c]);g[c]=h(m*m+q*q)/h(k*k+n*n)}return g};
function GraphicalEq(a){this.FS=a;this.minFreq=40;this.maxFreq=16E3;this.bandsPerOctave=1;this.filters=[];this.freqzs=[];this.calculateFreqzs=!0;this.recalculateFilters=function(){var a=Math.round(Math.log(this.maxFreq/this.minFreq)*this.bandsPerOctave/Math.LN2);this.filters=[];for(var b=0;b<a;b++){var c=this.minFreq*Math.pow(2,b/this.bandsPerOctave),f=new Biquad(DSP.PEAKING_EQ,this.FS);f.setDbGain(0);f.setBW(1/this.bandsPerOctave);f.setF0(c);this.filters[b]=f;this.recalculateFreqz(b)}};this.setMinimumFrequency=
function(a){this.minFreq=a;this.recalculateFilters()};this.setMaximumFrequency=function(a){this.maxFreq=a;this.recalculateFilters()};this.setBandsPerOctave=function(a){this.bandsPerOctave=a;this.recalculateFilters()};this.setBandGain=function(a,b){if(0>a||a>this.filters.length-1)throw"The band index of the graphical equalizer is out of bounds.";if(!b)throw"A gain must be passed.";this.filters[a].setDbGain(b);this.recalculateFreqz(a)};this.recalculateFreqz=function(a){if(this.calculateFreqzs){if(0>
a||a>this.filters.length-1)throw"The band index of the graphical equalizer is out of bounds. "+a+" is out of [0, "+this.filters.length-1+"]";if(!this.w){this.w=Float32Array(400);for(var b=0;b<this.w.length;b++)this.w[b]=Math.PI/this.w.length*b}this.freqzs[a]=DSP.mag2db(DSP.freqz([this.filters[a].b0,this.filters[a].b1,this.filters[a].b2],[this.filters[a].a0,this.filters[a].a1,this.filters[a].a2],this.w))}};this.process=function(a){for(var b=0;b<this.filters.length;b++)a=this.filters[b].process(a);
return a};this.processStereo=function(a){for(var b=0;b<this.filters.length;b++)a=this.filters[b].processStereo(a);return a}}function MultiDelay(a,d,b,c){this.delayBufferSamples=new Float32Array(a);this.delayInputPointer=d;this.delayOutputPointer=0;this.delayInSamples=d;this.masterVolume=b;this.delayVolume=c}
MultiDelay.prototype.setDelayInSamples=function(a){this.delayInSamples=a;this.delayInputPointer=this.delayOutputPointer+a;this.delayInputPointer>=this.delayBufferSamples.length-1&&(this.delayInputPointer-=this.delayBufferSamples.length)};MultiDelay.prototype.setMasterVolume=function(a){this.masterVolume=a};MultiDelay.prototype.setDelayVolume=function(a){this.delayVolume=a};
MultiDelay.prototype.process=function(a){for(var d=new Float32Array(a.length),b=0;b<a.length;b++){var c=(null===this.delayBufferSamples[this.delayOutputPointer]?0:this.delayBufferSamples[this.delayOutputPointer])*this.delayVolume+a[b];this.delayBufferSamples[this.delayInputPointer]=c;d[b]=c*this.masterVolume;this.delayInputPointer++;this.delayInputPointer>=this.delayBufferSamples.length-1&&(this.delayInputPointer=0);this.delayOutputPointer++;this.delayOutputPointer>=this.delayBufferSamples.length-
1&&(this.delayOutputPointer=0)}return d};function SingleDelay(a,d,b){this.delayBufferSamples=new Float32Array(a);this.delayInputPointer=d;this.delayOutputPointer=0;this.delayInSamples=d;this.delayVolume=b}SingleDelay.prototype.setDelayInSamples=function(a){this.delayInSamples=a;this.delayInputPointer=this.delayOutputPointer+a;this.delayInputPointer>=this.delayBufferSamples.length-1&&(this.delayInputPointer-=this.delayBufferSamples.length)};
SingleDelay.prototype.setDelayVolume=function(a){this.delayVolume=a};
SingleDelay.prototype.process=function(a){for(var d=new Float32Array(a.length),b=0;b<a.length;b++)this.delayBufferSamples[this.delayInputPointer]=a[b],d[b]=this.delayBufferSamples[this.delayOutputPointer]*this.delayVolume,this.delayInputPointer++,this.delayInputPointer>=this.delayBufferSamples.length-1&&(this.delayInputPointer=0),this.delayOutputPointer++,this.delayOutputPointer>=this.delayBufferSamples.length-1&&(this.delayOutputPointer=0);return d};
function Reverb(a,d,b,c,f,g){this.delayInSamples=d;this.masterVolume=b;this.mixVolume=c;this.delayVolume=f;this.dampFrequency=g;this.NR_OF_SINGLEDELAYS=this.NR_OF_MULTIDELAYS=6;this.LOWPASSL=new IIRFilter2(DSP.LOWPASS,g,0,44100);this.LOWPASSR=new IIRFilter2(DSP.LOWPASS,g,0,44100);this.singleDelays=[];for(d=0;d<this.NR_OF_SINGLEDELAYS;d++)b=1+d/7,this.singleDelays[d]=new SingleDelay(a,Math.round(this.delayInSamples*b),this.delayVolume);this.multiDelays=[];for(d=0;d<this.NR_OF_MULTIDELAYS;d++)b=1+d/
10,this.multiDelays[d]=new MultiDelay(a,Math.round(this.delayInSamples*b),this.masterVolume,this.delayVolume)}Reverb.prototype.setDelayInSamples=function(a){this.delayInSamples=a;var d;for(a=0;a<this.NR_OF_SINGLEDELAYS;a++)d=1+a/7,this.singleDelays[a].setDelayInSamples(Math.round(this.delayInSamples*d));for(a=0;a<this.NR_OF_MULTIDELAYS;a++)d=1+a/10,this.multiDelays[a].setDelayInSamples(Math.round(this.delayInSamples*d))};Reverb.prototype.setMasterVolume=function(a){this.masterVolume=a};
Reverb.prototype.setMixVolume=function(a){this.mixVolume=a};Reverb.prototype.setDelayVolume=function(a){this.delayVolume=a;for(a=0;a<this.NR_OF_SINGLEDELAYS;a++)this.singleDelays[a].setDelayVolume(this.delayVolume);for(a=0;a<this.NR_OF_MULTIDELAYS;a++)this.multiDelays[a].setDelayVolume(this.delayVolume)};Reverb.prototype.setDampFrequency=function(a){this.dampFrequency=a;this.LOWPASSL.set(a,0);this.LOWPASSR.set(a,0)};
Reverb.prototype.process=function(a){var d=new Float32Array(a.length),b=DSP.deinterleave(a);this.LOWPASSL.process(b[DSP.LEFT]);this.LOWPASSR.process(b[DSP.RIGHT]);for(var c=DSP.interleave(b[DSP.LEFT],b[DSP.RIGHT]),b=0;b<this.NR_OF_MULTIDELAYS;b++)d=DSP.mixSampleBuffers(d,this.multiDelays[b].process(c),0===2%b,this.NR_OF_MULTIDELAYS);c=new Float32Array(d.length);for(b=0;b<this.NR_OF_SINGLEDELAYS;b++)c=DSP.mixSampleBuffers(c,this.singleDelays[b].process(d),0===2%b,1);for(b=0;b<c.length;b++)c[b]*=this.mixVolume;
d=DSP.mixSampleBuffers(c,a,0,1);for(b=0;b<d.length;b++)d[b]*=this.masterVolume;return d};BeatDetektor=function(a,d,b){"undefined"==typeof a&&(a=85);"undefined"==typeof d&&(d=169);this.config="undefined"!=typeof b?b:BeatDetektor.config;this.BPM_MIN=a;this.BPM_MAX=d;this.quarter_counter=this.half_counter=this.beat_counter=0;this.a_freq_range=Array(this.config.BD_DETECTION_RANGES);this.ma_freq_range=Array(this.config.BD_DETECTION_RANGES);this.maa_freq_range=Array(this.config.BD_DETECTION_RANGES);this.last_detection=Array(this.config.BD_DETECTION_RANGES);this.ma_bpm_range=Array(this.config.BD_DETECTION_RANGES);
this.maa_bpm_range=Array(this.config.BD_DETECTION_RANGES);this.detection_quality=Array(this.config.BD_DETECTION_RANGES);this.detection=Array(this.config.BD_DETECTION_RANGES);this.reset()};
BeatDetektor.prototype.reset=function(){for(var a=0;a<this.config.BD_DETECTION_RANGES;a++)this.a_freq_range[a]=0,this.ma_freq_range[a]=0,this.maa_freq_range[a]=0,this.last_detection[a]=0,this.ma_bpm_range[a]=this.maa_bpm_range[a]=60/this.BPM_MIN+(60/this.BPM_MAX-60/this.BPM_MIN)*(a/this.config.BD_DETECTION_RANGES),this.detection_quality[a]=0,this.detection[a]=!1;this.ma_quality_total=this.ma_quality_avg=0;this.bpm_contest=[];this.bpm_contest_lo=[];this.bpm_predict=this.win_bpm_int_lo=this.win_bpm_int=
this.win_val_lo=this.winning_bpm_lo=this.win_val=this.winning_bpm=this.current_bpm_lo=this.current_bpm=this.quality_avg=this.quality_total=0;this.is_erratic=!1;this.quarter_counter=this.half_counter=this.beat_counter=this.bpm_timer=this.last_update=this.last_timer=this.bpm_offset=0};
BeatDetektor.config_default={BD_DETECTION_RANGES:128,BD_DETECTION_RATE:12,BD_DETECTION_FACTOR:0.915,BD_QUALITY_DECAY:0.6,BD_QUALITY_TOLERANCE:0.96,BD_QUALITY_REWARD:10,BD_QUALITY_STEP:0.1,BD_MINIMUM_CONTRIBUTIONS:6,BD_FINISH_LINE:60,BD_REWARD_TOLERANCES:[0.001,0.005,0.01,0.02,0.04,0.08,0.1,0.15,0.3],BD_REWARD_MULTIPLIERS:[20,10,8,1,0.5,0.25,0.125,0.0625,0.03125]};BeatDetektor.config=BeatDetektor.config_default;
BeatDetektor.prototype.process=function(a,d){if(this.last_timer)if(this.last_timer>a)this.reset();else if(this.last_update=a-this.last_timer,this.last_timer=a,1<this.last_update)this.reset();else{var b,c,f,g=60/this.BPM_MAX,h=60/this.BPM_MIN,p=d.length/this.config.BD_DETECTION_RANGES,e=0;for(c=0;c<d.length;c+=p){this.a_freq_range[e]=0;for(b=c;b<c+p;b++)f=Math.abs(d[b]),this.a_freq_range[e]+=f;this.a_freq_range[e]/=p;this.ma_freq_range[e]-=(this.ma_freq_range[e]-this.a_freq_range[e])*this.last_update*
this.config.BD_DETECTION_RATE;this.maa_freq_range[e]-=(this.maa_freq_range[e]-this.ma_freq_range[e])*this.last_update*this.config.BD_DETECTION_RATE;f=this.ma_freq_range[e]*this.config.BD_DETECTION_FACTOR>=this.maa_freq_range[e];this.ma_bpm_range[e]>h&&(this.ma_bpm_range[e]=h);this.ma_bpm_range[e]<g&&(this.ma_bpm_range[e]=g);this.maa_bpm_range[e]>h&&(this.maa_bpm_range[e]=h);this.maa_bpm_range[e]<g&&(this.maa_bpm_range[e]=g);var m=!1;if(!this.detection[e]&&f){var q=a-this.last_detection[e];if(q<h&&
q>g){for(b=0;b<this.config.BD_REWARD_TOLERANCES.length;b++)Math.abs(this.ma_bpm_range[e]-q)<this.ma_bpm_range[e]*this.config.BD_REWARD_TOLERANCES[b]&&(this.detection_quality[e]+=this.config.BD_QUALITY_REWARD*this.config.BD_REWARD_MULTIPLIERS[b],m=!0);m&&(this.last_detection[e]=a)}else if(q>=h){q/=2;if(q<h&&q>g)for(b=0;b<this.config.BD_REWARD_TOLERANCES.length;b++)Math.abs(this.ma_bpm_range[e]-q)<this.ma_bpm_range[e]*this.config.BD_REWARD_TOLERANCES[b]&&(this.detection_quality[e]+=this.config.BD_QUALITY_REWARD*
this.config.BD_REWARD_MULTIPLIERS[b],m=!0);m||(q*=2);this.last_detection[e]=a}m?(b=this.detection_quality[e]/this.quality_avg*this.config.BD_QUALITY_STEP,1<b&&(b=1),this.ma_bpm_range[e]-=(this.ma_bpm_range[e]-q)*b,this.maa_bpm_range[e]-=(this.maa_bpm_range[e]-this.ma_bpm_range[e])*b):q>=g&&q<=h?(this.detection_quality[e]<this.quality_avg*this.config.BD_QUALITY_TOLERANCE&&this.current_bpm&&(this.ma_bpm_range[e]-=(this.ma_bpm_range[e]-q)*this.config.BD_QUALITY_STEP,this.maa_bpm_range[e]-=(this.maa_bpm_range[e]-
this.ma_bpm_range[e])*this.config.BD_QUALITY_STEP),this.detection_quality[e]-=this.config.BD_QUALITY_STEP):q>=h&&(this.detection_quality[e]<this.quality_avg*this.config.BD_QUALITY_TOLERANCE&&this.current_bpm&&(this.ma_bpm_range[e]-=0.5*(this.ma_bpm_range[e]-this.current_bpm),this.maa_bpm_range[e]-=0.5*(this.maa_bpm_range[e]-this.ma_bpm_range[e])),this.detection_quality[e]-=this.config.BD_QUALITY_STEP)}if(!m&&a-this.last_detection[e]>h||f&&Math.abs(this.ma_bpm_range[e]-this.current_bpm)>this.bpm_offset)this.detection_quality[e]-=
this.detection_quality[e]*this.config.BD_QUALITY_STEP*this.config.BD_QUALITY_DECAY*this.last_update;0.001>this.detection_quality[e]&&(this.detection_quality[e]=0.001);this.detection[e]=f;e++}for(c=p=this.quality_total=0;c<this.config.BD_DETECTION_RANGES;c++)this.quality_total+=this.detection_quality[c];this.quality_avg=this.quality_total/this.config.BD_DETECTION_RANGES;this.quality_total?(this.ma_quality_avg+=(this.quality_avg-this.ma_quality_avg)*this.last_update*this.config.BD_DETECTION_RATE/2,
this.maa_quality_avg+=(this.ma_quality_avg-this.maa_quality_avg)*this.last_update,this.ma_quality_total+=(this.quality_total-this.ma_quality_total)*this.last_update*this.config.BD_DETECTION_RATE/2,this.ma_quality_avg-=3*0.98*this.ma_quality_avg*this.last_update):this.quality_avg=0.001;0>=this.ma_quality_total&&(this.ma_quality_total=0.001);0>=this.ma_quality_avg&&(this.ma_quality_avg=0.001);e=0;f=this.current_bpm;b=[];if(this.quality_avg)for(c=0;c<this.config.BD_DETECTION_RANGES;c++)this.detection_quality[c]*
this.config.BD_QUALITY_TOLERANCE>=this.ma_quality_avg&&(this.ma_bpm_range[c]<h&&this.ma_bpm_range[c]>g)&&(m=Math.round(1E3*(60/this.maa_bpm_range[c])),m=Math.abs(Math.ceil(m)-1E3*(60/this.current_bpm))<Math.abs(Math.floor(m)-1E3*(60/this.current_bpm))?Math.ceil(m/10):Math.floor(m/10),m=parseInt(m/10),typeof("undefined"==b[m])&&(b[m]=0),b[m]+=this.detection_quality[c]/this.quality_avg,p++,0==f?f=this.maa_bpm_range[c]:e+=Math.abs(f-this.maa_bpm_range[c]));g=c=0;if(p>=this.config.BD_MINIMUM_CONTRIBUTIONS){for(var k in b)b[k]>
g&&(g=b[k],c=k);this.bpm_predict=60/(c/10);this.bpm_offset=e/p;this.current_bpm||(this.current_bpm=this.bpm_predict)}this.current_bpm&&this.bpm_predict&&(this.current_bpm-=(this.current_bpm-this.bpm_predict)*this.last_update);k=0;for(var n in this.bpm_contest)k<this.bpm_contest[n]&&(k=this.bpm_contest[n]),this.bpm_contest[n]>this.config.BD_FINISH_LINE/2&&(c=parseInt(Math.round(n/10)),this.bpm_contest_lo[c]!=this.bpm_contest_lo[c]&&(this.bpm_contest_lo[c]=0),this.bpm_contest_lo[c]+=this.bpm_contest[n]/
6*this.last_update);if(k>this.config.BD_FINISH_LINE)for(n in this.bpm_contest)this.bpm_contest[n]=this.bpm_contest[n]/k*this.config.BD_FINISH_LINE;k=0;for(n in this.bpm_contest_lo)k<this.bpm_contest_lo[n]&&(k=this.bpm_contest_lo[n]);if(k>this.config.BD_FINISH_LINE)for(n in this.bpm_contest_lo)this.bpm_contest_lo[n]=this.bpm_contest_lo[n]/k*this.config.BD_FINISH_LINE;for(n in this.bpm_contest)this.bpm_contest[n]-=this.bpm_contest[n]*(this.last_update/this.config.BD_DETECTION_RATE);for(n in this.bpm_contest_lo)this.bpm_contest_lo[n]-=
this.bpm_contest_lo[n]*(this.last_update/this.config.BD_DETECTION_RATE);this.bpm_timer+=this.last_update;c=k=0;if(this.bpm_timer>this.winning_bpm/4&&this.current_bpm){this.win_val_lo=this.win_val=0;if(this.winning_bpm)for(;this.bpm_timer>this.winning_bpm/4;)this.bpm_timer-=this.winning_bpm/4;this.quarter_counter++;this.half_counter=parseInt(this.quarter_counter/2);this.beat_counter=parseInt(this.quarter_counter/4);g=parseInt(Math.round(10*(60/this.current_bpm)));"undefined"==typeof this.bpm_contest[g]&&
(this.bpm_contest[g]=0);this.bpm_contest[g]+=this.config.BD_QUALITY_REWARD;for(n in this.bpm_contest)this.win_val<this.bpm_contest[n]&&(k=n,this.win_val=this.bpm_contest[n]);k&&(this.win_bpm_int=parseInt(k),this.winning_bpm=60/(k/10));for(n in this.bpm_contest_lo)this.win_val_lo<this.bpm_contest_lo[n]&&(c=n,this.win_val_lo=this.bpm_contest_lo[n]);c&&(this.win_bpm_int_lo=parseInt(c),this.winning_bpm_lo=60/c)}}else this.last_timer=a};BeatDetektor.modules={};BeatDetektor.modules.vis={};
BeatDetektor.modules.vis.BassKick=function(){this.is_kick=!1};BeatDetektor.modules.vis.BassKick.prototype.process=function(a){this.is_kick=a.detection[0]&&a.detection[1]||1.4<a.ma_freq_range[0]/a.maa_freq_range[0]};BeatDetektor.modules.vis.BassKick.prototype.isKick=function(){return this.is_kick};BeatDetektor.modules.vis.VU=function(){this.vu_levels=[]};
BeatDetektor.modules.vis.VU.prototype.process=function(a,d){var b,c,f=0;"undefined"==typeof d&&(d=a.last_update);for(b=0;b<a.config.BD_DETECTION_RANGES;b++)c=a.ma_freq_range[b]/a.maa_freq_range[b],c>f&&(f=c);for(b=0;b<a.config.BD_DETECTION_RANGES;b++)if(c=a.ma_freq_range[b]/a.maa_freq_range[b],c!=c&&(c=0),1<c?(c-=1,1<c&&(c=1),c>this.vu_levels[b]?this.vu_levels[b]=c:a.current_bpm&&(this.vu_levels[b]-=3*(this.vu_levels[b]-c)*d*(1/a.current_bpm))):a.current_bpm&&(this.vu_levels[b]-=2*(d/a.current_bpm)),
0>this.vu_levels[b]||this.vu_levels[b]!=this.vu_levels[b])this.vu_levels[b]=0};BeatDetektor.modules.vis.VU.prototype.getLevel=function(a){return this.vu_levels[a]};
