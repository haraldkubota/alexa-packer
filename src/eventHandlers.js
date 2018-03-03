/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'
var storage = require('./storage'),
  textHelper = require('./textHelper')

var registerEventHandlers = function(eventHandlers, skillContext) {
  eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    //if user said a one shot command that triggered an intent event,
    //it will start a new session, and then we should avoid speaking too many words.
    skillContext.needMoreHelp = false
  }

  eventHandlers.onLaunch = function(launchRequest, session, response) {
    //Speak welcome message and ask user questions
    //based on whether there are players or not.
    storage.loadBox(session, function(currentBox) {
      var speechOutput = '',
        reprompt
      if (currentBox.data.name == '') {
        speechOutput += 'Box Packer, let\'s pack a box. What\'s the box name?'
        reprompt = 'What label does the box have?'
      } else {
        speechOutput += 'Box Packer, ' +
          'you have ' + currentBox.data.content.length + ' things in your ' +
          currentBox.data.name + ' box.'
        speechOutput += ' You can add or remove items.'
        reprompt = textHelper.completeHelp
      }
      response.ask(speechOutput, reprompt)
    })
  }
}
exports.register = registerEventHandlers