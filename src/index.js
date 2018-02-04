/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Multiple slots: has 2 slots (BoxName and ItemName)
 * - Database Interaction: demonstrates how to read and write data to DynamoDB.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - LITERALslot: demonstrates how to any random text
 * - Dialog and Session state: Handles two models, both a one-shot ask and tell model, and a multi-turn dialog model.
 *   If the user provides an incorrect slot in a one-shot model, it will direct to the dialog model.
 *   See the examples section for sample interactions of these models.
 *
 * Examples:
 * Dialog model:
 *
 * One-shot model:
 */
'use strict'
var BoxPacker = require('./boxPacker')

exports.handler = function (event, context) {
  var boxPacker = new BoxPacker()
  boxPacker.execute(event, context)
}
