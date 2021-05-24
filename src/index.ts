import Discord, { Message } from 'discord.js'
import { lexer, parser, operations } from 'flex-parse'
import { botToken } from '../config/config.json'

const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

function parseCommand(content: string): string | undefined {
  const match = content.match(/\!bc\s(.*$)/)
  console.log(match)
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
  console.log('Syntax: ')
  console.log(syntax)
  let matcher
  try {
    matcher = new RegExp(`^[0-9|${syntax}]+`)
  } catch (e) {
    console.log(e)
    console.log('I failed')
    return content
  }
  console.log(contentStripped)
  const match = contentStripped.match(matcher)
  console.log(match)
  return match?.[0]
}

let count = 0
let parseError: Error | undefined

client.on('message', message => {
  switch (parseCommand(message.content)) {
    case 'error':
      if (parseError) {
        message.reply(parseError.message)
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
        count++
        message.react('✅')
      } else {
        count = 0
        message.react('😞')
        message.reply('Count ruined! Starting at 1')
      }
    } catch (e) {
      parseError = e
    }
  }
});

client.login(botToken);