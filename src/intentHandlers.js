/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'
var textHelper = require('./textHelper'),
  storage = require('./storage')

var registerIntentHandlers = function(intentHandlers, skillContext) {

  intentHandlers.AddBoxIntent = function(intent, session, response) {
    // Add a box
    console.log('AddBox: Intent.slots=' + JSON.stringify(intent.slots) + ' session=' +
      JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    storage.loadBox(session, function(myContext) {
      myContext.data.name = boxName
      myContext.save(function(x) {
        console.log('x=', x)
      })
      response.ask('What would you like to add to the box ' + boxName + '?',
        'You can also take out something or ask what\'s in the box')
    })
  }

  intentHandlers.RemoveBoxIntent = function(intent, session, response) {
    // Remove a box
    console.log('RemoveBox Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    storage.loadBox(session, function(myContext) {
      myContext.data.name = ''
      myContext.data.content = []
      myContext.save(function(x) {
        console.log('x=', x)
      })
      response.tell('Box ' + boxName + ' removed. It no longer exists.')
    })
  }

  intentHandlers.AddItemIntent = function(intent, session, response) {
    // Add an item to a box
    let boxName = intent.slots.BoxName.value
    let itemName = intent.slots.ItemName.value
    console.log('AddItem Intent.slots=' + JSON.stringify(intent.slots) + ' session=' +
      JSON.stringify(session))
    storage.loadBox(session, function(myContext) {
      console.log('(5) boxName=' + boxName + ' and myContext=' + JSON.stringify(
        myContext))

      myContext.data.content.push(itemName)
      console.log('(6) data=' + JSON.stringify(myContext))
      myContext.save(function() {
        console.log('Write to DynamoDB successful')
        response.ask('Item ' + itemName + ' added to box ' + boxName +
          '. Anything else?')
      })
    })
  }


  intentHandlers.TakeItemIntent = function(intent, session, response) {
    // Add an item to a box
    console.log('Removeitem Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    let itemName = intent.slots.ItemName.value
    storage.loadBox(session, function(myContext) {
      console.log('(7) myContext=' + JSON.stringify(myContext))
      if (boxName === undefined) {
        if (myContext.data.name)
          boxName = myContext.data.name
        else
          boxName = 'unknown'
      }
      const itemIndex = myContext.data.content.indexOf(itemName)
      if (itemIndex === -1) {
        response.ask('There is no ' + itemName + ' in the box ' + boxName +
          '. Anything else I can do?')
      } else {
        myContext.data.content.splice(itemIndex, 1)
        console.log('(8) data=' + JSON.stringify(myContext))
        myContext.save(function() {
          console.log('Write to DynamoDB successful')
          response.ask('Item ' + itemName + ' removed from box ' + boxName +
            '. Anything else?')
        })
      }
    })
  }

  intentHandlers.ListBoxItemsIntent = function(intent, session, response) {
    // List contents of a box
    console.log('ListBoxItems Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    let speechOutput
    storage.loadBox(session, function(myContext) {
      if (myContext.data.content.length == 0) {
        speechOutput = 'Box ' + boxName + ' is empty.'
      } else {
        speechOutput = 'This is the contents of box ' + boxName + ':'
        let sortedItems = myContext.data.content.sort()
        let lastItem = sortedItems[0]
        let lastCount = 1
        for (let i = 1; i < sortedItems.length; ++i) {
          if (sortedItems[i] != lastItem) {
            speechOutput += lastCount + ' ' + lastItem
            if (lastCount != 1) speechOutput += 's'
            speechOutput += ', '
            lastItem = sortedItems[i]
            lastCount = 1
          } else {
            ++lastCount
          }
        }
        speechOutput += ' and ' + lastCount + ' ' + lastItem
        if (lastCount != 1) speechOutput += 's'
      }
      response.ask(speechOutput + '. What would you like to do now?')
    })
  }

  intentHandlers.RenameBoxIntent = function(intent, session, response) {
    // Rename a box
    console.log('RenameBox Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let newBoxName = intent.slots.BoxName.value.split(' ')[1]
    storage.loadBox(session, function(myContext) {
      let oldBoxName = myContext.data.name
      myContext.data.name = newBoxName
      response.ask('Renamed box from ' + oldBoxName + ' to ' + newBoxName)
    })
  }

  intentHandlers['AMAZON.HelpIntent'] = function(intent, session, response) {
    var speechOutput = textHelper.completeHelp
    if (skillContext.needMoreHelp) {
      response.ask(textHelper.completeHelp + ' So, how can I help?',
        'How can I help?')
    } else {
      response.tell(textHelper.completeHelp)
    }
  }

  intentHandlers['AMAZON.CancelIntent'] = function(intent, session, response) {
    if (skillContext.needMoreHelp) {
      response.tell('Okay. When you want to put things into boxes, let me know.')
    } else {
      response.tell('')
    }
  }

  intentHandlers['AMAZON.StopIntent'] = function(intent, session, response) {
    if (skillContext.needMoreHelp) {
      response.tell('Okay.  When you want to put things into boxes, let me know.')
    } else {
      response.tell('')
    }
  }
}
exports.register = registerIntentHandlers