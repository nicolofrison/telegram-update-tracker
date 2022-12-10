import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

import initSixt from './trackers/sixt.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

//method for invoking start command
 
bot.command('start', ctx => {
  console.log(ctx.from)
  bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
  })
})

initSixt(bot);

bot.launch();