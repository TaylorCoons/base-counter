import Discord from 'discord.js'
import { lexer, parser } from 'flex-parse'
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
  try {
    const contentFormated = lexer.stripWhite(message.content)
    console.log(contentFormated)
    const value = parser.parse(lexer.lex(contentFormated))
    console.log(`Value: ${value}`)
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
    console.log(e)
  }
});

client.login(botToken);