import Discord, { Message, MessageEmbed } from 'discord.js'
import { lexer, parser, operations, groupings } from 'flex-parse'
import { botToken } from '../config/config.json'

const development = process.env.NODE_ENV === 'development' ? true : false

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
  const opSyntax = operations.operations.map((operation) => {
    return operation.syntax
  }).join('|')
  const groupingSyntax = groupings.groupings.map((grouping) => {
    return `${grouping.startSyntax}|${grouping.endSyntax}`
  }).join('|')
  const syntax = `${opSyntax}|${groupingSyntax}`
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

function countRuined(message: Message, reason: string) {
  error = reason
  prevUser = undefined
  count = 0
  message.reply('Count ruined! Starting at 1')
  message.react('😞')
}

function handleWhy(message: Message) {
  const description = error ?? 'The last command did not have an error'
  const embed = new MessageEmbed()
    .setTitle('Why?')
    .setColor(0xFF0000)
    .setDescription(description)
  message.reply(embed)
}

function handleOperations(message: Message) {
  const opCommands = operations.operations.map((operation) => {
    return `${operation.name}: ${operation.syntax}\n`
  }).join('')
  const groupingCommands = groupings.groupings.map((grouping) => {
    return `${grouping.startSyntax}${grouping.endSyntax}\n`
  }).join('')
  let description = `Operations: \n${opCommands}\n` 
  description += `Groupings: \n${groupingCommands}`
  const embed = new MessageEmbed()
    .setTitle('Available Operations')
    .setColor(0xFFFF00)
    .setDescription(description)
  message.reply(embed)
}

function handleHelp(message: Message) {
  let help = 'help: Display this help message\n'
  help += 'operations: Show Available operations\n'
  help += 'why: Show the last error'
  const embed = new MessageEmbed()
    .setTitle('Help')
    .setColor(0xFFFF00)
    .setDescription(help)
  message.reply(embed)
}

client.on('message', message => {
  const command = parseCommand(message.content)
  if (command) {
    switch (parseCommand(message.content)) {
      case 'why':
        handleWhy(message)
        return
      case 'operations':
        handleOperations(message)
        return
      case 'help':
      default:
        handleHelp(message)
    }
  }
  const contentFormated = formatContent(message.content)
  if (contentFormated) {
    try {
      const value = parser.parse(lexer.lex(contentFormated))
      if (value === count + 1) {
        if (message.member) {
          const currUser = message.member.user.username
          if (development) {
            prevUser = undefined
          }
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