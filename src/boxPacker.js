/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const AlexaSkill = require('./AlexaSkill'),
  eventHandlers = require('./eventHandlers'),
  intentHandlers = require('./intentHandlers')

var APP_ID = undefined //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var skillContext = {}

/**
 * BoxPacker is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var BoxPacker = function() {
  AlexaSkill.call(this, APP_ID)
  skillContext.needMoreHelp = true
}


// Extend AlexaSkill
BoxPacker.prototype = Object.create(AlexaSkill.prototype)
BoxPacker.prototype.constructor = BoxPacker

eventHandlers.register(BoxPacker.prototype.eventHandlers, skillContext)
intentHandlers.register(BoxPacker.prototype.intentHandlers, skillContext)

module.exports = BoxPacker
