const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('quick.db')
//<:evet:550024944759734303>  <:hayir:550024944612933643> <:soru:550024945116119056>

exports.run = async function (client, message, args) {

  
      if(!args[0]) {
      return message.channel.send('<:yasak:619596371674005515> Lütfen botun ID giriniz..');
    }
  
     if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(args[0]) === false) {
         return message.channel.send('<:yasak:619596371674005515> Bot bulunamadı veya `!bot-bilgi <BOT ID>` şeklinde kullanın.');
   }
  }
  
  
   const reason = args[0];
  const bilig = new Discord.RichEmbed()
  .setThumbnail(db.fetch(`botlar.${reason}.avatar`))
  .setColor("7088D7")
  
  .addField("ID", reason)
  .addField("İsim", db.fetch(`botlar.${reason}.isim`))
  .addField("Sahip", "<@" + db.fetch(`botlar.${reason}.sahipid`)  + "> (" + db.fetch(`botlar.${reason}.sahipid`) + ")")
  .addField("Oy", db.fetch(`botlar.${reason}.oy`) || '0')
  .addField("Kütüphane", db.fetch(`botlar.${reason}.kutuphane`))
  .addField("Doğrulama Bilgisi", `${db.fetch(`botlar.${reason}.sertifika`) || 'Bulunamadı'}`)
  .addField("Kısa Açıklama", "```" + db.fetch(`botlar.${reason}.kisaaciklama`) + "```")
  .addField("Uzun Açıklama", "```" + db.fetch(`botlar.${reason}.uzunaciklama`) + "```")
  
  message.channel.send(bilig)
  
  
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["bot","botinfo"],
  permLevel: 0
};

exports.help = {
  name: 'bot-bilgi',
  kategori: 'moderasyon',
  description: 'İstediğiniz kişiyi banlar.',
  usage: 'ban-bot <kisi> <sebep>',
};
