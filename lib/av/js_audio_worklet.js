function Queue(){this.a=[],this.b=0,this.residue=null}function AudioQueueMGR(){this.ssrcQueueMap=new Map,AudioQueueMGR.prototype.AddQueue=function(e){var t=new Queue;return this.ssrcQueueMap.set(e,t),t},AudioQueueMGR.prototype.DeleteQueue=function(e){this.ssrcQueueMap.delete(e)},AudioQueueMGR.prototype.GetQueue=function(e){return this.ssrcQueueMap.get(e)},AudioQueueMGR.prototype.GetQueueData=function(e){return this.ssrcQueueMap.get(e).dequeue()},AudioQueueMGR.prototype.PutQueueData=function(e,t){this.ssrcQueueMap.get(e).enqueue(t)},AudioQueueMGR.prototype.GetQueueLength=function(e){var t=this.ssrcQueueMap.get(e);return null!==t?t.getLength():0}}Queue.prototype.getLength=function(){return this.a.length-this.b},Queue.prototype.isEmpty=function(){return 0==this.a.length},Queue.prototype.enqueue=function(e){this.a.push(e)},Queue.prototype.dequeue=function(){if(0!=this.a.length){var e=this.a[this.b];return 2*++this.b>=this.a.length&&(this.a=this.a.slice(this.b),this.b=0),e}return null},Queue.prototype.peek=function(){return 0<this.a.length?this.a[this.b]:void 0};var AudioMGR=function(){function e(){this.map=new Map,this.AudioQueueMGR=new AudioQueueMGR,this.timemap=new Map}return e.prototype.Add=function(e,t){this.map.put(e,t),this.AudioQueueMGR.AddQueue(e)},e.prototype.Clear=function(){this.map.clear()},e.prototype.Keys=function(){return this.map.keys()},e.prototype.UpdateSSRCTimeMap=function(e){this.timemap=e},e.prototype.GetSSRCTimeMap=function(e){return this.timemap?this.timemap.get(e):null},e}();function Float32Concat(e,t){var u=0;if(null!==e){u=e.length;var r=new Float32Array(u+t.length);return r.set(e),r.set(t,u),r}return t}function Int16ToFloat32(e,t,u){for(var r=new Float32Array(e.length-t),a=t;a<u;a++){var i=e[a]/32768;i>1&&(i=1),i<-1&&(i=-1),r[a]=i}return r}function Update_Audio_SSRC_Time(e){localAudioDecMGR&&localAudioDecMGR.UpdateSSRCTimeMap(e)}function Uint8ToFloat32(e){for(var t=new Int16Array(e.length/2),u=0;u<t.length;u++)t[u]=(255&e[2*u])+((255&e[2*u+1])<<8);return Int16ToFloat32(t,0,t.length)}function Get_Decoded_Audio_Buffer_Length(e){return 0,localAudioDecMGR?localAudioDecMGR.AudioQueueMGR.GetQueueLength(0):0}var audioEncodePort,audioDecodePort,start_play=!1,localAudioDecMGR=new AudioMGR,audioBufferSize=15,start_capture=!1,current_ssrc=null,audio_count=0,AUDIO_UPDATE_SSRC_TIME_INTERVAL=23,LOG_PRINT_INTERVAL=1e4,log_count=0,post_capture_audio_count=0,AUDIO_CAPTURE_MAX_COUNT=10,capture_audio_buffer=new Float32Array(128*AUDIO_CAPTURE_MAX_COUNT);function Put_Audio_Frame_Buffer(e,t,u,r){if(e=0,start_play&&localAudioDecMGR){var a=localAudioDecMGR.AudioQueueMGR.GetQueue(e);if(a||(a=localAudioDecMGR.AudioQueueMGR.AddQueue(e)),t=Uint8ToFloat32(t),u){var o=new Map,i=u.length/12,n=0,s=0;for(n=0;n<i;n++){e=0;for(s=12*n+0;s<12*n+4;s++)e+=u[s]*Math.pow(256,s-12*n);e>>=10;var d=0;for(s=12*n+4;s<12*n+12;s++)d+=u[s]*Math.pow(256,s-12*n-4);o.set(e,d)}var c={buffer:t,ntptime:o}}else c={buffer:t,ntptime:null};a.enqueue(c);var l=Get_Decoded_Audio_Buffer_Length(e);if(l>50)for(var f=l-audioBufferSize;f>=0;)Delete_Decoded_Audio_Frame(e),f--;else l>15&&audioDecodePort&&audioDecodePort.postMessage({status:"delay"})}}function Delete_Decoded_Audio_Frame(e){if(0,localAudioDecMGR){var t=localAudioDecMGR.AudioQueueMGR.GetQueue(0);return t?t.dequeue():null}}function Get_SSRC_Latest_Time(e){if(e>>=10,localAudioDecMGR){var t=localAudioDecMGR.GetSSRCTimeMap(e);return null===t?0:t}}function Get_Decoded_Audio_Frame(e,t,u){if(localAudioDecMGR){0;var r=u,a=localAudioDecMGR.AudioQueueMGR.GetQueue(0),o=null;if(a){if(a.residue){if(a.residue.buffer.length>u)return o=a.residue.buffer.slice(0,u),a.residue.buffer=a.residue.buffer.slice(u),Update_Audio_SSRC_Time(a.residue.ntptime),o;if(a.residue.buffer.length===u)return o=a.residue.buffer,Update_Audio_SSRC_Time(a.residue.ntptime),a.residue=null,o;o=a.residue.buffer,Update_Audio_SSRC_Time(a.residue.ntptime),a.residue=null,u-=o.length}for(var i=a.dequeue();i&&i.buffer.length<u;)Update_Audio_SSRC_Time(i.ntptime),o=Float32Concat(o,i.buffer),u-=i.buffer.length,i=a.dequeue();if(i&&(Update_Audio_SSRC_Time(i.ntptime),0!==u&&i.buffer.length===u?o=Float32Concat(o,i.buffer):0!==u&&i.buffer.length>u&&(o=Float32Concat(o,i.buffer.slice(0,u)),a.residue={buffer:i.buffer.slice(u),ntptime:i.ntptime})),o){if(o.length<r)return a.residue={buffer:o,ntptime:null},null;if(o.length==r)return o}}return null}}class ZoomAudioWorletProcessor extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:"pcm",defaultValue:1}]}constructor(){super(),this.port.onmessage=this.handleMessage.bind(this)}handleMessage(e){var t=e.data;switch(t.status){case"data":start_play&&(Put_Audio_Frame_Buffer(t.data.ssrc,t.data.data,t.data.time,this),current_ssrc=t.data.ssrc);break;case"stopPlayAudio":start_play=!1;break;case"startPlayAudio":start_play=!0;break;case"close":break;case"StartCaptureAudio":start_capture=!0,post_capture_audio_count=0;break;case"CurrentSSRC":current_ssrc=t.data;break;case"encodeAudioPort":audioEncodePort&&audioEncodePort.close(),audioEncodePort=e.ports[0];break;case"decodeAudioPort":var u=this;audioDecodePort&&audioDecodePort.close(),(audioDecodePort=e.ports[0]).onmessage=function(e){if(start_play&&(Put_Audio_Frame_Buffer(e.data.ssrc,e.data.data,e.data.time,u),current_ssrc=e.data.ssrc),start_capture){var t={command:"EchoCancel",data:e.data.aec,channels:e.data.channels,sampleHz:e.data.sampleHz};audioEncodePort.postMessage(t,[t.data.buffer])}}}}process(e,t,u){let r=e[0],a=t[0];var o=Get_Decoded_Audio_Frame(0,0,a[0].length);if(start_capture){new Float32Array(r[0].length);capture_audio_buffer.set(r[0],128*post_capture_audio_count),++post_capture_audio_count==AUDIO_CAPTURE_MAX_COUNT&&(post_capture_audio_count=0,audioEncodePort.postMessage({command:"EncodeAudioFrame",data:capture_audio_buffer}))}if(current_ssrc&&++audio_count==AUDIO_UPDATE_SSRC_TIME_INTERVAL){audio_count=0;var n=Get_SSRC_Latest_Time(current_ssrc);n&&this.port.postMessage({status:"InstantAudioTime",data:n})}for(let e=0;e<a.length;++e){let t=a[e];for(let e=0;e<t.length;++e)o&&e<o.length?t[e]=o[e]:++log_count==LOG_PRINT_INTERVAL&&(log_count=0)}return!0}}registerProcessor("zoomAudioWorklet",ZoomAudioWorletProcessor);