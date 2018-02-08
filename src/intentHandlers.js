/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

'use strict'
var textHelper = require('./textHelper'),
  storage = require('./storage')

// Return undefined if no box found, return index if box found
function findBox(data, boxName) {
  let index=-1
  console.log('(0) data='+JSON.stringify(data))
  for (let i=0; i<data.boxes.length; ++i) {
    if (data.boxes[i].name == boxName) {
      index=i
      break
    }
  }
  return index
}

var registerIntentHandlers = function(intentHandlers, skillContext) {

  intentHandlers.CreateBoxIntent = function(intent, session, response) {
    // Add a box
    console.log('CreateBox: Intent.slots=' + JSON.stringify(intent.slots) + ' session=' +
      JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    storage.loadBox(session, function(myContext) {
      let boxIndex=findBox(myContext.data, boxName)
      if (boxIndex !== -1) {
        response.ask('A box with the name '+boxName+' already exists.', 'If you\'d like to create a new box, just let me know.')
      }
      myContext.data.lastBox=boxName
      myContext.data.boxes.push({name: boxName, content: []})
      myContext.save(function() {
        response.ask('New box '+boxName+' created. What would you like to add to the box?',
          'Anything to put in?')
      })
    })
  }

  intentHandlers.RemoveBoxIntent = function(intent, session, response) {
    // Remove a box
    console.log('RemoveBox Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    storage.loadBox(session, function(myContext) {
      let boxIndex=findBox(myContext.data, boxName)
      if (boxIndex !== -1) {
        // myContext.data.lastBox = boxName
        myContext.data.boxes.splice(boxIndex, 1)
        myContext.save(function() {
          response.tell('Box ' + boxName + ' has passed on. This box is no more! It has ceased to be! It\'s expired and gone to meet its maker! This is a late box! It rests in peace! THIS IS AN EX-BOX!')
        })
      } else {
        response.ask('Box '+boxName+' does not exist.', 'What else would you like to do?')
      }
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
      if (boxName === undefined)
        boxName = myContext.data.lastBox
      let boxIndex=findBox(myContext.data, boxName)
      if (boxIndex !== -1) {
        myContext.data.lastBox=boxName
        myContext.data.boxes[boxIndex].content.push(itemName)
        console.log('(6) myContext=' + JSON.stringify(myContext))

        myContext.save(function() {
          response.ask('Item ' + itemName + ' added to box ' + boxName +
            '. Anything else?', 'Anything else I can do?')
        })
      } else {
        response.ask('There is no box '+boxName+'.', 'Anything else I can do?')
      }
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
      if (boxName === undefined)
        boxName = myContext.data.lastBox
      let boxIndex=findBox(myContext.data, boxName)
      if (boxIndex !== -1) {
        myContext.data.lastBox=boxName
        const itemIndex = myContext.data.boxes[boxIndex].content.indexOf(itemName)
        if (itemIndex === -1) {
          response.ask('There is no ' + itemName + ' in the box ' + boxName +
            '. Anything else I can do?', 'Anything else I can do?')
        } else {
          myContext.data.boxes[boxIndex].content.splice(itemIndex, 1)
          console.log('(8) data=' + JSON.stringify(myContext))
          myContext.save(function() {
            console.log('Write to DynamoDB successful')
            response.ask('Item ' + itemName + ' removed from box ' + boxName +
              '. Anything else?', 'Anything else I can do?')
          })
        }
      } else {
        response.ask('There is no box '+boxName+'.', 'Anything else I can do?')
      }
    })
  }

  function makePlural(count, thing) {
    if (count == 1) {
      return thing
    } else {
      let s
      switch(thing) {
      case 'mouse': 
        s='mice'
        break
      case 'cactus':
        s='cacti'
        break
      case 'woman':
        s='women'
        break
      default:
        s = thing + ((thing.charAt(thing.length-1) == 's') ? 'es' : 's')
      }
      return s
    }
  }

  intentHandlers.ListBoxItemsIntent = function(intent, session, response) {
    // List contents of a box
    console.log('ListBoxItems Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    let boxName = intent.slots.BoxName.value
    let speechOutput
    storage.loadBox(session, function(myContext) {
      if (boxName === undefined)
        boxName = myContext.data.lastBox
      let boxIndex=findBox(myContext.data, boxName)
      if (boxIndex === -1) {
        speechOutput = 'Box ' + boxName + ' does not exist.'
      } else {
        myContext.data.lastBox=boxName
        if (myContext.data.boxes[boxIndex].content.length == 0) {
          speechOutput = 'Box ' + boxName + ' is empty.'
        } else {
          speechOutput = 'This is the contents of box ' + boxName + ': '
          let sortedItems = myContext.data.boxes[boxIndex].content.sort()
          let lastItem = sortedItems[0]
          let lastCount = 1
          for (let i = 1; i < sortedItems.length; ++i) {
            if (sortedItems[i] != lastItem) {
              speechOutput += lastCount + ' ' + makePlural(lastCount, lastItem) + ', '
              lastItem = sortedItems[i]
              lastCount = 1
            } else {
              ++lastCount
            }
          }
          if (sortedItems.length !== 2) {
            speechOutput += ' and '
          }
          speechOutput += lastCount + ' ' + makePlural(lastCount, lastItem)
        }
        response.ask(speechOutput + '. What would you like to do now?', 'Anything else I can do?')
      }
    })
  }

  intentHandlers.RenameBoxIntent = function(intent, session, response) {
    // Rename a box
    console.log('RenameBox Intent.slots=' + JSON.stringify(intent.slots) +
      ' session=' + JSON.stringify(session))
    response.ask('I cannot rename yet.', 'Anything else I can do?')
    if (0) {
      let newBoxName = intent.slots.BoxName.value.split(' ')[1]
      storage.loadBox(session, function(myContext) {
        let oldBoxName = myContext.data.name
        myContext.data.name = newBoxName
        myContext.save(function() {
          console.log('Write to DynamoDB successful')
          response.ask('Renamed box from ' + oldBoxName + ' to ' + newBoxName)
        })
      })
    }
  }

  intentHandlers['AMAZON.HelpIntent'] = function(intent, session, response) {
    var speechOutput = textHelper.completeHelp
    if (skillContext.needMoreHelp) {
      response.ask(speechOutput + ' So, how can I help?',
        'How can I help?')
    } else {
      response.tell(speechOutput)
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