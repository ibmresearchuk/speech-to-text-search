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

(function() {

  var micRunning = false;
  
  $(document).ready(function() {
    $('#search').on('search',null,null,runSearch);
    
    getToken(function(err,token) {
      if (err) {
        console.log(err)
      } else {
        var mic = new Microphone();
        var s2t = new SpeechToText(token,mic,onStarted,onTranscript,onStopped);
        $('#microphone').click({
          s2t: s2t
        }, microphoneOnClick);
        $('#microphone').toggleClass('available');
      }
    });
  });
  
  function getToken(callback) {
    var url = '/token';
    var tokenRequest = new XMLHttpRequest();
    tokenRequest.open('POST', url, true);
    tokenRequest.setRequestHeader('csrf-token',$('meta[name="ct"]').attr('content'));
    tokenRequest.onreadystatechange = function() {
      if (tokenRequest.readyState === 4) {
        if (tokenRequest.status === 200) {
          var token = tokenRequest.responseText;
          callback(null, token);
        } else {
          var error = 'Cannot reach server';
          if (tokenRequest.responseText){
            try {
              error = JSON.parse(tokenRequest.responseText);
            } catch (e) {
              error = tokenRequest.responseText;
            }
          }
          callback(error);
        }
      }
    };
    tokenRequest.send();
  }
  
  function microphoneOnClick(evt) {
    console.log('microphoneOnClick()');
    var s2t = evt.data.s2t;
    if (!micRunning) {
      s2t.start();
    } else {
      s2t.stop();
    }
  }
  
  function onStarted() {
    console.log('Starting microphone');
    $('#microphone').toggleClass('recording');
    $('#search').val('');
    micRunning = true;
  }
  
  function onTranscript(transcript) {
    $('#search').val(transcript);
  }
  
  function onStopped() {
    if (micRunning) {
      console.log('Stopping microphone');
      $('#microphone').toggleClass('recording');
      micRunning = false;
      runSearch();
    }
  }
  
  function runSearch() {
    var query = $('#search').val();
    if (query.length > 0) {
      window.location.href = 'http://www.ibm.com/Search/?q=' + encodeURI(query);
    }
  }

})()
