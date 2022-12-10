import axios from 'axios';

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

const registeredDevices = [];

const init = function(bot) {
  bot.hears('Register to sixt update event', ctx => {
    if (!registeredDevices.includes(ctx.chat.id)) {
      registeredDevices.push(ctx.chat.id);
      
      bot.telegram.sendMessage(ctx.chat.id, 'You subscribed to receive sixt notifications', {})
    } else {
      
      bot.telegram.sendMessage(ctx.chat.id, 'You are already subscribed', {})
    }
  })
  
  setInterval(async () => {
    if (await isCheapestSubscriptionCarAvailable()) {
      for (const chatId of registeredDevices) {
        bot.telegram.sendMessage(chatId, "The sixt plus cheapest car is available again", {});
      }
    }
  }, 300000);
}

export default init;