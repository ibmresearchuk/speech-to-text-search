# Speech to Text Search Application

  This sample application was created using the [express application generator][express-generator], is heavily based on the [Speech to Text Browser Application][speech-to-text-nodejs] code and so can be set up and used by following the instructions on that page.
  
  The aim here is to provide a very cut down set of code that can be used to add voice input for search style applications in the web browser.  As such, it simply:
  
  1. controls the microphone on/off state;
  
  2. sends audio to the [Speech to Text][service_url] service over WebSockets;
  
  3. receives transcribed text;
  
  4. automatically detects when the speaker has stopped speaking;
  
  5. times out after 5 seconds of inactivity if no speech is heard;
  
  6. provides a sample web interface that redirects your web browser to an search of [ibm.com];
  
  7. provides a NodeJS interface for getting a BlueMix speech to text token;
  
  8. demonstrates how to get a BlueMix speech to text token from the local server.

## Further Usage and Modifications

  There are two reusable components that you can use to easily integrate search style Speech to Text into your application.  These are:
  
  1. Microphone.js
  
    This is more or less a carbon copy of the Microphone.js object from the [Speech to Text Browser Application][speech-to-text-nodejs].  It's an HTML 5 web audio interface for accessing your microphone using a web browser.
    
    All you need to do here is create an instance of a Microphone object that you'll pass in when you create a SpeechToText object.
    
    e.g. `var mic = new Microphone();`
  
  2. SpeechToText.js
  
    A very simple and massively cut down implementation of the web sockets code from the [Speech to Text Browser Application][speech-to-text-nodejs].  
    
    Create an instance of a SpeechToText object and pass it:
    
    * a token for your BlueMix speech to text service
    
    * the Microphone instance you created
    
    * a callback for when recording has started (useful for clearing any previous search and changing your UI)
    
    * a callback for transcription events (this will periodically receive a String containing the latest transcription)
    
    * a callback for when recording has stopped (useful for changing your UI)
    
    e.g. `var s2t = new SpeechToText(token,mic,onStarted,onTranscript,onStopped);`
    
    *Note:* The default voice model is set to US English (broadband).  No interface has been provided here to allow a user to change this.  Adding that feature should be trivial or you could automatically detect the region of your user and set the appropriate model automatically.
  
  The code in `speechsearch.js` demonstrates how the above objects can be used.  The HTML found in `index.html` shows how they can all be tied together into a simple browser interface.

## License

  Licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE).

[service_url]: http://www.ibm.com/smarterplanet/us/en/ibmwatson/developercloud/speech-to-text.html
[speech-to-text-nodejs]: https://github.com/watson-developer-cloud/speech-to-text-nodejs
[ibm.com]: http://ibm.com
[express-generator]: http://expressjs.com/en/starter/generator.html
