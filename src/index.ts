import Discord, { Message } from 'discord.js'
import { lexer, parser, operations } from 'flex-parse'
import { botToken } from '../config/config.json'

const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

function parseCommand(content: string): string | undefined {
  const match = content.match(/^\!bc\s(.*$)/)
  if (match) {
    return match[1]
  }
  return undefined
}

function formatContent(content: string): string | undefined {
  const contentStripped = lexer.stripWhite(content)
  const syntax = operations.operations.map((operation) => {
    return operation.syntax
  }).join('|')
  let matcher
  try {
    matcher = new RegExp(`^[0-9|${syntax}]+`)
  } catch (e) {
    return content
  }
  const match = contentStripped.match(matcher)
  return match?.[0]
}

let count = 0
let error: string | undefined = undefined
let prevUser: string | undefined = undefined

function countRuined(message: Discord.Message, reason: string) {
  error = reason
  prevUser = undefined
  count = 0
  message.reply('Count ruined! Starting at 1')
  message.react('😞')
}

client.on('message', message => {
  switch (parseCommand(message.content)) {
    case 'why':
      if (error) {
        message.reply(error)
      } else {
        message.reply('The last command did not have an error')
      }
      return
  }
  const contentFormated = formatContent(message.content)
  if (contentFormated) {
    try {
      const value = parser.parse(lexer.lex(contentFormated))
      if (value === count + 1) {
        if (message.member) {
          const currUser = message.member.user.username
          if (prevUser === currUser) {
            countRuined(message, 'The same user can\'t count twice in a row')
          } else {
            count++
            error = 'The last command was correct!'
            message.react('✅')
            prevUser = currUser
          }
        }
      } else {
        countRuined(message, `The submission (${value}) did not match the expected count (${count+1})`)
      }
    } catch (e) {
      error = e.message
    }
  }
});

client.login(botToken);