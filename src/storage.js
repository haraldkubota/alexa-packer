/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/*

Data format per userId:

data: {
  name: BOXNAME,
  content: [item1, item2, item3...]
}

New:

data: {
  lastBox: '',
  boxes: [
    {
      name: BOXNAME,
      content: [{count: N, item: ITEMNAME},...]  
    },
    {
      name: BOXNAME2,
      content: [...]
    }
    ]
  }
*/


'use strict'
var AWS = require('aws-sdk')

var storage = (function() {
  var dynamodb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    region: 'ap-northeast-1'
  })

  /*
   * The Box class stores all box states for the user
   */
  function Box(session, data) {
    if (data) {
      console.log('data is not undefined!')
      this.data = data
    } else {
      this.data = {lastBox: '', boxes:[]}
    }
    this._session = session
    console.log('new box: ' + JSON.stringify(this.data))
  }

  Box.prototype = {
    isEmpty: function() {
      var boxData = this.data
      return boxData.boxes.length == 0 // ???
    },

    save: function(callback) {
      //save the box states in the session,
      //so next time we can save a read from dynamoDB
      this._session.attributes.currentBox = this.data
      console.log('Saving ' + JSON.stringify(this.data))
      dynamodb.putItem({
        TableName: 'BoxPackerData',
        Item: {
          CustomerId: {
            S: this._session.user.userId
          },
          Data: {
            S: JSON.stringify(this.data)
          }
        }
      }, function(err, data) {
        if (err) {
          console.log(err, err.stack)
        } else {
          console.log('Successful write ' + JSON.stringify(data))
        }
        if (callback) {
          callback()
        }
      })
    }
  }

  return {
    loadBox: function(session, callback) {
      if (session.attributes.currentBox) {
        console.log('get new box, populate from session=' + JSON.stringify(session.attributes
          .currentBox))
        callback(new Box(session, session.attributes.currentBox))
        return
      }
      console.log('Getting data from DynamoDB')
      dynamodb.getItem({
        TableName: 'BoxPackerData',
        Key: {
          CustomerId: {
            S: session.user.userId
          }
        }
      }, function(err, data) {
        var currentBox
        if (err) {
          console.log(err, err.stack)
          currentBox = new Box(session)
          session.attributes.currentBox = currentBox.data
          callback(currentBox)
        } else if (data.Item === undefined) {
          currentBox = new Box(session)
          session.attributes.currentBox = currentBox.data
          callback(currentBox)
        } else {
          console.log('get box from dynamodb=' + data.Item.Data.S)
          currentBox = new Box(session, JSON.parse(data.Item.Data.S))
          session.attributes.currentBox = currentBox.data
          callback(currentBox)
        }
      })
    },
    newBox: function(session) {
      return new Box(session)
    }
  }
})()
module.exports = storage