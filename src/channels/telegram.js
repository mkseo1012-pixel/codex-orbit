export class TelegramChannel {
  constructor(token=process.env.TELEGRAM_BOT_TOKEN){this.token=token}
  async send(chatId,text){if(!this.token)throw Error('TELEGRAM_BOT_TOKEN is not configured');const r=await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});if(!r.ok)throw Error(`Telegram error ${r.status}`);return r.json()}
}
