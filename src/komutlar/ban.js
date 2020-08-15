const Discord = require('discord.js');
const client = new Discord.Client();
const db = require("quick.db");


exports.run = async(client, message, args) => {


  if (!message.guild) {
  const ozelmesajuyari = new Discord.RichEmbed()
  .setColor(0xFF0000)
  .setTimestamp()
  .setAuthor(message.author.username, message.author.avatarURL)
  .addField(':warning: Uyarı :warning:', '`ban` adlı komutu özel mesajlarda kullanamazsın.')
  return message.author.sendEmbed(ozelmesajuyari); }
  let guild = message.guild
  let reason = args.slice(1).join(' ');
  let user = message.mentions.users.first() || message.guild.members.get(args[0]);
  let modlog = guild.channels.find('name', 'ban');
  if (!modlog) return message.reply('`ban` kanalını bulamıyorum.');
  if (reason.length < 1) return message.reply(`!ban @testüye sebep`);
  if (message.mentions.users.size < 1) return message.reply('Kimi banlayacağını yazmalısın.').catch(console.error);

  if (!message.guild.member(user).bannable) return message.reply(':x: Yetkilileri banlayamam.');
  message.guild.ban(user, 2);



user.send(`<:yasak:619596371674005515> You are banned **${guild.name}** this server. \n \nReason: **${reason}**  Admin: ** ${message.author.username}** `)
  const embed = new Discord.RichEmbed()
    .setColor("AEED13")
    .setTimestamp()
    .setThumbnail(user.avatarURL)
    .setTitle("<:oke:616540844408832010> | A user is banned from the server!")
    .addField('User:', `${user.username}#${user.discriminator} (${user.id})`)
    .addField('Admin:', `${message.author.username}#${message.author.discriminator}`)
    .addField('Reason:', reason);
  return guild.channels.get(modlog.id).sendEmbed(embed);


  
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["ban"],
  permLevel: 3
};

exports.help = {
  name: 'ban',
  description: 'İstediğiniz kişiyi sunucudan yasaklar.',
  usage: 'ban [kullanıcı] [sebep]'
};