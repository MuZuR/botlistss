const Discord = require("discord.js");
const client = new Discord.Client();

exports.run = (client, message, args) => {
 message.channel.send("<:yasak:619596371674005515> Bu rolü almak için botunuzun sitemizde ekli olması gerekmektedir. Eğer botunuz sitemizde ekliyse yetkililerden rolü isteyiniz. \n\nhttps://topbots.cf/")

}
    

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0

};

exports.help = {
  name: 'js',
  category: 'moderasyon',
  description: 'İstediğiniz kişiyi uyarır.',
  usage: 'uyar <@kişi-etiket> <sebep>'
};