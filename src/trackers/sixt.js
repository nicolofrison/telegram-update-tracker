import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sixtChatsDir = __dirname + "/../trackers-chats";
const sixtChatsFile = sixtChatsDir + "/sixt";

const isCheapestSubscriptionCarAvailable = async function() {
  const url = "https://web-api.orange.sixt.com/v1/subscription/subscriptions/offers/country?currency=USD&isoCountryCode=US";
  const axiosResponse = await axios.get(url, {
    headers: {
      'accept-language': 'en-US,en;q=0.9'
    }
  });
  const response = await axiosResponse.data;

  if (response) {
    if (response.offers) {
      const cheapestOffer = response.offers.sort((a, b) => a.prices.totalPrice.amount.value - b.prices.totalPrice.amount.value)[0];
      // console.log(cheapestOffer);

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const earliestPickupDate = new Date(cheapestOffer.earliestPickupDate);
      if (earliestPickupDate < nextWeek) {
        return true;
      }
      
      return false;
    }
  }

  throw new Error("Error on retrieving the page");
}

const init = function(bot) {
  bot.hears('Register to sixt update event', ctx => {
    const chatId = ctx.chat.id.toString();
    let fileExists = false;

    if (fs.existsSync(sixtChatsFile)) {
      fileExists = true;
      const chatIds = fs.readFileSync(sixtChatsFile).toString().split("\n");

      if (chatIds.includes(chatId)) {
        bot.telegram.sendMessage(ctx.chat.id, 'You are already subscribed', {});
        return;
      }
    } else {
      fs.mkdirSync(sixtChatsDir, { recursive: true });
    }
    
    fs.appendFileSync(sixtChatsFile, `${fileExists ? '\n' : ''}${chatId}`);

    bot.telegram.sendMessage(ctx.chat.id, 'You subscribed to receive sixt notifications', {});
  })
  
  setInterval(async () => {
    if (fs.existsSync(sixtChatsFile) && await isCheapestSubscriptionCarAvailable()) {
      const chatIds = fs.readFileSync(sixtChatsFile).toString().split("\n");

      for (const chatId of chatIds) {
        bot.telegram.sendMessage(parseInt(chatId), "The sixt plus cheapest car is available again", {});
      }
    }
  }, 300000);
}

export default init;