# Simple AWS Lambda function for Alexa

A simple [AWS Lambda](http://aws.amazon.com/lambda) function that demonstrates how to write a skill for the Amazon Echo using the Alexa SDK.

# What this skill does

The idea is to help the user to put things into named boxes and be able to add or remove those things later.
Alexa keeps track what's inside and can tell you what's inside a box or where a specific item is.

# TODO

- Scan items to add, but the bar code needs to be connected to a name somehow
- Use phone to scan items and take a photo. Same problem as bar code: the item needs to get a name

## Examples
### Dialog model:
    User: "Alexa, tell box packer to start packing box seven."
    Alexa: "Name the items you like to add. Finish with saying 'done'."
    User: "A giraffe"
    Alexa: "Adding a giraffe to box seven."
    User: "A bike"
    Alexa: "Adding a bike to box seven"
    User: "Done"

### One-shot model:
    User: "Alexa, tell box packer to put the giraffe into box seven."
    User: "Alexa, ask box packer to add a bike to box seven"
    User: "Alexa, tell box packer to remove the giraffe from box seven."
    User: "Alexa, ask box packer what is in box seven."
