const db = require('quick.db')
const Discord = require('discord.js')

exports.run = async (bot, message, args) => {
 if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Bu komutu kullanmak için`MESAJLARI_YÖNET` yetkisine sahip olmalısın!')
  let kanal = message.mentions.channels.first()

  if (!kanal) return message.channel.send(`Kanalıda etiketlemelisiniz.`)
  
    db.set(`otobsilici_${kanal.id+message.guild.id}`, "<#"+kanal.id+">")
    
        db.set(`otobsilicia_${kanal.id+message.guild.id}`, "acik")

      message.channel.send(`**Artık ${kanal} adlı kanalda bir bot mesaj yazarsa 5 saniye sonra silinecek.**`)
    
  
 
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 3
};

exports.help = {
  name: 'botmesajsilici',
  description: 'Botun pingini gösterir.',
  usage: ''
};