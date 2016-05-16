/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Speech to text handler using WebSockets
 * @constructor
 * @this {SpeechToText}
 * @param {string} token A token for a BlueMix Speech-to-Text service
 * @param {Microphone} mic A Microphone object
 * @param {function} startedCB() Called as after the Microphone has started recording
 * @param {function} transcriptCB(string) Called whenever text is received
 * @param {function} stoppedCB() Called after the Microphone has stopped recording
 */
function SpeechToText(token,mic,startedCB,transcriptCB,stoppedCB) {
  this.url = 'wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=' + token;
  
  this.mic = mic;
  this.startedCB = startedCB;
  this.transcriptCB = transcriptCB;
  this.stoppedCB = stoppedCB;
}

/**
 * Start Microphone recording and send to BlueMix for transcription
 * @constructor
 * @this {SpeechToText}
 */
SpeechToText.prototype.start = function() {
  var self = this;
  
  try {
    this.socket = new WebSocket(this.url);
  } catch (err) {
    console.error('WS connection error: ', err);
  }

  this.socket.onopen = function(evt) {
    var message = {
      'content-type': 'audio/l16;rate=16000',
      'interim_results': true,
      'continuous': false,
      'inactivity_timeout': 5,
      'model': 'en-US_BroadbandModel'
    };
    self.listening = false;
    self.socket.send(JSON.stringify(message));
    self.mic.record();
    self.startedCB();
  };
  
  this.socket.onmessage = function(evt) {
    var msg = JSON.parse(evt.data);
    if (msg.error) {
      console.log(msg.error);
      return;
    }
    if (msg.state === 'listening') {
      // Early cut off, without notification
      if (!self.listening) {
        self.mic.onAudio = function(blob) {
          if (self.socket.readyState < 2) {
            self.socket.send(blob);
          }
        };
        self.listening = true;
      } else {
        self.socket.close();
        self.mic.stop();
        self.stoppedCB();
      }
    }
    if (msg.results && Array.isArray(msg.results) && msg.results[0] && Array.isArray(msg.results[0].alternatives)) {
      var transcript = msg.results[0].alternatives[0].transcript.trim();
      self.transcriptCB(transcript);
    }
  };

  this.socket.onerror = function(evt) {
    console.log('WS onerror: ', evt);
  };

  this.socket.onclose = function(evt) {
    //console.log('WS onclose: ', evt);
    self.mic.stop();
    self.stoppedCB();
  };
};

/**
 * Stop Microphone recording and stop sending to BlueMix
 * @constructor
 * @this {SpeechToText}
 */
SpeechToText.prototype.stop = function() {
  this.socket.close();
};
