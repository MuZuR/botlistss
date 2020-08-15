const Discord = require("discord.js");
const request = require('request');
const db = require('quick.db');
const fs = require('fs');
const url = require("url");
const path = require("path");
var express = require('express');
var app = express();
const { get } = require('snekfetch');
const { resolve, join } = require('path');
const { Canvas } = require('canvas-constructor');
const { loadImage } = require('canvas')
const moment = require("moment");
require("moment-duration-format");
const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");
const md = require("marked");
const generator = require('generate-password');

module.exports = (client) => {

const templateDir = path.resolve(`${process.cwd()}${path.sep}/src/dosya/sayfa/`); // SITE DOSYA KONTROL
app.use("/css", express.static(path.resolve(`${templateDir}${path.sep}/ekstra/css`))); // CSS KONTROL
app.use("/img", express.static(path.resolve(`${templateDir}${path.sep}/ekstra/img`))); // CSS KONTROL
app.use("/js", express.static(path.resolve(`${templateDir}${path.sep}/ekstra/js`))); // CSS KONTROL

passport.serializeUser((user, done) => { // PASSPORT
done(null, user);
});
passport.deserializeUser((obj, done) => {  // PASSPORT
done(null, obj);
});
// GEREKLI BILGILER
passport.use(new Strategy({
clientID: "643071529940156436",
clientSecret: client.ayarlar.oauthSecret,
callbackURL: client.ayarlar.callbackURL,
scope: ["identify"]
},
(accessToken, refreshToken, profile, done) => {
process.nextTick(() => done(null, profile));
}));

app.use(session({
secret: '123',
resave: false,
saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.locals.domain = process.env.PROJECT_DOMAIN;

  // SITE DOSYASI AKTIF
  
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

  // LAN YUNUS BURAYA ELLEME ! 
  
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
extended: true
})); 
// GIRIS 
function checkAuth(req, res, next) {
if (req.isAuthenticated()) return next();
req.session.backURL = req.url;
res.redirect("/giris");
}

const renderTemplate = (res, req, template, data = {}) => {
const baseData = {
bot: client,
path: req.path,
user: req.isAuthenticated() ? req.user : null
};
res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/giris", (req, res, next) => {
if (req.session.backURL) {
req.session.backURL = req.session.backURL;
} else if (req.headers.referer) {
const parsed = url.parse(req.headers.referer);
if (parsed.hostname === app.locals.domain) {
req.session.backURL = parsed.path;
}
} else { 
req.session.backURL = "/";
}
next();
},
passport.authenticate("discord"));
// EGER GEREKLI BILGILERI BULAMASSA
app.get("/baglanti-hatası", (req, res) => {
renderTemplate(res, req, "autherror.ejs");
});
// CALLBACK
app.get("/callback", passport.authenticate("discord", { failureRedirect: "/autherror" }), async (req, res) => {
if (req.session.backURL) {
const url = req.session.backURL;
req.session.backURL = null;
res.redirect(url);
} else {
res.redirect("/");
}
});
// CIKIS
app.get("/cikis", function(req, res) {
req.session.destroy(() => {
req.logout();
res.redirect("/");
});
});

app.get("/", (req, res) => {
renderTemplate(res, req, "index.ejs");
});

//app.get("/", (req, res) => {
//renderTemplate(res, req, "index.ejs");
//});

  app.get("/license", (req, res) => { // BOT SAYFASI
 
renderTemplate(res, req, "license.ejs")
});
  app.get("/privacy", (req, res) => { // BOT SAYFASI
 
renderTemplate(res, req, "privacy.ejs")
});
  app.get("/tos", (req, res) => { // BOT SAYFASI
 
renderTemplate(res, req, "tos.ejs")
});
  app.get("/google09d7e5a18cf45ff7.html", (req, res) => { // BOT SAYFASI
 
renderTemplate(res, req, "google09d7e5a18cf45ff7.html")
});
  
    app.get("/verification", checkAuth, (req, res) => { // BOT SAYFASI
 
  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "verification.ejs", {kisi})
    };
  });
});
  
app.get("/bots", (req, res) => { // BOT SAYFASI
 
renderTemplate(res, req, "bots.ejs")
});

app.get("/verifications/:userID", checkAuth, (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "verifications.ejs", {kisi})
    };
  });

});


app.get("/botyonetim/hata", (req, res) => { // BOR DUZENLEME SAYFASI
  
renderTemplate(res, req, "botduzenlehata.ejs")
});
app.get("/vote/:botID", (req, res) => {
var id = req.params.botID

request({
url: `https://discordapp.com/api/v7/users/${id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

if (db.fetch(`${id}.avatar`) !== `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`) {
db.set(`${id}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)
}

}
})

renderTemplate(res, req, 'vote.ejs', {id})

});
app.get("/servers", (req, res) => { // BOT EKLEME 

 
renderTemplate(res, req, "servers.ejs")
});
  
app.get("/addbot", checkAuth, (req, res) => { // BOT EKLEME 

 
renderTemplate(res, req, "addbot.ejs")
});
// BOT EKLE 
  // DATABASE BOLUMU !
app.post("/addbot", checkAuth, (req, res) => {

let ayar = req.body

if (ayar === {} || !ayar['botid'] || !ayar['botprefix'] || !ayar['kutuphane'] || !ayar['kisa-aciklama'] || !ayar['uzun-aciklama']) return res.redirect('/botyonetim/hata')

let ID = ayar['botid']

  if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(ID) === true) {
     res.json({
       error: 'Already Bot Available.'
     });
   }
  }


request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)
// DATABASE KAYIT BOLUMU
db.set(`botlar.${ID}.id`, sistem.id)
db.set(`botlar.${ID}.isim`, sistem.username+"#"+sistem.discriminator)

db.set(`botlar.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sahip = JSON.parse(body)


db.set(`botlar.${ID}.prefix`, ayar['botprefix'])
db.set(`botlar.${ID}.kutuphane`, ayar['kutuphane'])
db.set(`botlar.${ID}.sahip`, sahip.username+"#"+sahip.discriminator)
db.set(`botlar.${ID}.sahipid`, sahip.id)
if (ayar['botlar.${ID}.yedek-sahip']) {
db.set(`botlar.${ID}.yedek-sahip`, ayar['yedeksahip'])
}
  
db.set(`botlar.${ID}.kisaaciklama`, ayar['kisa-aciklama'])
db.set(`botlar.${ID}.uzunaciklama`, ayar['uzun-aciklama'])
if (ayar['botsite']) {
db.set(`botlar.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`botlar.${ID}.github`, ayar['github'])
}
if (ayar['botdestek']) {
db.set(`botlar.${ID}.destek`, ayar['botdestek'])
}

db.set(`kbotlar.${req.user.id}.${ID}`, db.fetch(`botlar.${ID}`))

res.redirect("/");
// OZEL MESAJ BULUMU // @WindBOT Adlı Kişinin WindBOT Adlı Botu Onay Sırasına Girdi !
// Hey ! "@! ๖̶̶̶ۣۣۜۜ͜ζ͜͡xChairs" botunuz olan "Discord Bots Asistan#8655" siraya eklendi.
client.channels.get(client.ayarlar.kayıt).send(`**<@${req.user.id}>** adlı kullanıcı **${sistem.username}** adlı botunu sisteme ekledi. `)
  

//
if (client.users.has(req.user.id) === true) { // Hey ! @! ๖̶̶̶ۣۣۜۜ͜ζ͜͡xChairs botunuz olan "Radyo Bot" siraya eklendi.
  client.users.get(req.user.id).send(`Merhaba <@${req.user.id}> botunuz \`${sistem.username}\` başarıyla sistemimize eklendi.`)
}                                                                          

}})
}})

});

app.get("/sasasa", (req, res) => { // BOT SAYFASI
 if (db.has('botlar') && db.has('kbotlar')) {
for (var i = 0; i < Object.keys(db.fetch('kbotlar')).length; i++) {
for (var x = 0; x < Object.keys(db.fetch('botlar')).length; x++) {
var bot = Object.keys(db.fetch('botlar'))[x]
var user = Object.keys(db.fetch('kbotlar'))[i]
if (db.has(`oylar.${bot}.${user}`)) {
   
        db.delete(`oylar.${bot}.${user}`)
  
}
}
}

	}

})
app.get("/profile/:userID", (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "profile.ejs", {kisi})
    };
  });

});

app.get("/profile/:userID/edit", checkAuth, (req, res) => {

  renderTemplate(res, req, "profile-edit.ejs")

});

app.post("/profile/:userID/edit", checkAuth, (req, res) => {

  if (req.params.userID !== req.user.id) return res.redirect('/');
  
  
  res.redirect('/')

request({
url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
          var kisi = JSON.parse(body)
    
    var ID = kisi.id
    
    db.set(`user.${ID}.tag`, `${kisi.username}#${kisi.discriminator}`)
    db.set(`user.${ID}.bio`, req.body['bio'])
    db.set(`user.${ID}.resim`, req.body['resim'])
    db.set(`user.${ID}.site`, req.body['site'])
    db.set(`user.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${kisi.id}/${kisi.avatar}.png`)
    
    
client.channels.get(client.ayarlar.kayıt).send(`<@${req.user.id}> adlı kullanıcı profilini düzenledi.`)

}})

  });

app.get("/kullanici/:userID/panel", checkAuth, (req, res) => {

renderTemplate(res, req, "panel.ejs")

});

  
app.get("/profile/:userID/bot/:botID/edit", checkAuth, (req, res) => {

var id = req.params.botID
var s = req.user.id

             if(db.fetch(`botlar.${id}.sahipid`) === s) { 
               
         } else {
return res.status(404).json({ error: 'This process can make a single bot owner.' })
           }

renderTemplate(res, req, "edit.ejs", {id})

});


app.post("/profile/:userID/bot/:botID/edit", checkAuth, (req, res) => {

let ayar = req.body
let ID = req.params.botID
let s = req.user.id

  
request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`botlar.${ID}.isim`, sistem.username+"#"+sistem.discriminator)

db.set(`botlar.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)

request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sahip = JSON.parse(body)
db.set(`botlar.${ID}.prefix`, ayar['botprefix'])
db.set(`botlar.${ID}.kutuphane`, ayar['kutuphane'])
db.set(`botlar.${ID}.sahip`, sahip.username+"#"+sahip.discriminator)
db.set(`botlar.${ID}.sahipid`, sahip.id)
db.set(`botlar.${ID}.kisaaciklama`, ayar['kisa-aciklama'])
db.set(`botlar.${ID}.uzunaciklama`, ayar['uzun-aciklama'])
if (ayar['botsite']) {
db.set(`botlar.${ID}.site`, ayar['botsite'])
}
if (ayar['github']) {
db.set(`botlar.${ID}.github`, ayar['github'])
}
if (ayar['botdestek']) {
db.set(`botlar.${ID}.destek`, ayar['botdestek'])
}
res.redirect("/");

}})
}})
  
  
client.channels.get(client.ayarlar.kayıt).send(`<@${db.fetch(`botlar.${ID}.sahipid`)}> adlı kullanıcı **${db.fetch(`botlar.${ID}.isim`)}** adlı botunu düzenledi.`)
  
  
});

    

app.get("/profile/:userID/bot/:botID/delete", checkAuth, (req, res) => {
  var id = req.params.botID
  renderTemplate(res, req, "delete.ejs", {id}) 
});

app.post("/profile/:userID/bot/:botID/delete", checkAuth, (req, res) => {

let ID = req.params.botID

db.delete(`botlar.${ID}`) 
db.delete(`kbotlar.${req.user.id}.${ID}`)

res.redirect("/bots");
});
  

  app.get("/profile/:userID/bot/:botID/token/iste", checkAuth, (req, res) => {
  var id = req.params.botID
  renderTemplate(res, req, "tokeniste.ejs", {id}) 
});

app.post("/profile/:userID/bot/:botID/token/iste", checkAuth, (req, res) => {

let ID = req.params.botID

       if (db.has('token')) {
    if (Object.keys(db.fetch('token')).includes(ID) === true) return res.status(404).json({ error: 'Zaten tokeni almışsınız.' });
}


var password = generator.generate({
        length: 48,
        numbers: true,
    })

db.set(`token.{ID}`, password)


  client.users.get(db.fetch(`botlar.${ID}.sahipid`) ).send("Botunuzun tokeni `" + password + "` olarak belirlendi. Lütfen tokeni kimseyle paylaşmayınız. ( Bu token site üzerinden işlem yapmanıza yarayacaktır.)")
  
res.redirect("/bots");
  
});

app.get("/view/:botID", (req, res) => {
var id = req.params.botID

request({
url: `https://discordapp.com/api/v7/users/${id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

if (db.fetch(`${id}.avatar`) !== `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`) {
db.set(`${id}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)
}

}
})

renderTemplate(res, req, 'view.ejs', {id})

});

  app.get("/servers/:botID", (req, res) => {
var id = req.params.botID

renderTemplate(res, req, 'view-servers.ejs', {id})

});

  
app.get("/bot/:botID/hata", (req, res) => {
renderTemplate(res, req, "hata.ejs")
});

app.get("/bot/:botID/oyver", checkAuth, async (req, res) => {
const ms = require("ms")
var id = req.params.botID
let user = req.user.id
  

 if (db.fetch(`botlar.${id}.durum`) === 'Beklemede' || db.has(`botlar.${id}.durum`) === false) { 
                 res.status(404).json({ error: 'Bot Not approved.' });
    }

   let cooldown = 8.64e+7, // 24 Saat
        amount = Math.floor(Math.random() * 1000) + 4000;      

    let lastDaily = await db.fetch(`oylar.${id}.${user}`);
    if (lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0) {
        let timeObj = ms(cooldown - (Date.now() - lastDaily));
  
      res.redirect('/bot/'+req.params.botID+'/hata')
    return
      
    } else {
     
        db.add(`botlar.${id}.oy`, 1)
  db.set(`oylar.${id}.${user}`,  Date.now())
      
    }
  
  
  
res.redirect('/view/'+req.params.botID)

});
  
  
  
  app.get("/yetkili/hata", (req, res) => {renderTemplate(res, req, "izinsizgiris.ejs")})

app.get("/yetkili", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel.ejs") 
});
  
  app.get("/yetkili-bekle", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-bekle.ejs") 
});
  
    app.get("/yetkili-onay", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-onay.ejs") 
});
  
    
    app.get("/yetkili-red", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-red.ejs") 
});
  
      app.get("/yetkili-ser", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-ser.ejs") 
});
  

  
        app.get("/yetkili-sers", checkAuth, (req, res) => {

  
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-serr.ejs") 
});

  
  app.get("/admin-p", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
renderTemplate(res, req, "admin-p.ejs") 
});

  app.get("/admin/yetkili-ata/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "admin-p-ata.ejs")
});

app.post("/admin/yetkili-ata/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  
  let ayar = req.body

if (ayar === {} || !ayar['yet-id']) return 

   let id = ayar['yet-id']
  
   
       if (db.has('yetkili')) {
    if (Object.keys(db.fetch('yetkili')).includes(id) === true) return res.status(404).json({ error: 'Yazdiginiz Id li yetkili zaten mevcut' });
}
   
  db.set(`yetkili.${id}.durum`, "true")
  
  
  
 res.status(404).json({ error: 'Basarili Bi Sekilde Moderatorluk Verildi !' });
});
  
    app.get("/admin/yetki-kapa/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "admin-p-kapa.ejs")
});

app.post("/admin/yetki-kapa/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')


  let ayar = req.body

if (ayar === {} || !ayar['yet-id']) return 

   let id = ayar['yet-id']
  
     if (db.has('yetkili')) {
    if (Object.keys(db.fetch('yetkili')).includes(id) === false) return res.status(404).json({ error: 'Yazdiginiz Id li bir yetkili bulamadim' });
}
  
   
  db.delete(`yetkili.${id}.durum`, "true")
  
  res.redirect("/admin-p")
});
  
  
    app.get("/admin/yetkili-sifirla/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "admin-p-sifirla.ejs")
});

app.post("/admin/yetkili-sifirla/", checkAuth, (req, res) => {
  if(!client.admin.includes(req.user.id) ) return res.redirect('/yetkili/hata')
  
  
  
     const sorted = Object.keys(db.fetch('botlar')).sort((a, b) => { return })
   const top = sorted.splice(0, Object.keys(db.fetch('botlar')).length) 
   const map = top.map(x=>x) 
	 for(var i = 0; i < Object.keys(db.fetch('botlar')).length; i++) { 
   let idd = map[i] 
          
 db.delete(`botlar.${idd}.oy`)
     
   }
  
  db.delete(`oylar`)
  
 res.status(404).json({ error: 'Basarili Bi Sekilde Butun Oylar Sifirlandi !' });
  
});
  
  
  
  
  
  
  
app.get("/botyonetici/onayla/:botID", checkAuth, (req, res) => {
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
let id = req.params.botID

db.set(`botlar.${id}.durum`, 'Onaylı')

res.redirect("/yetkili")
                                                    
client.channels.get(client.ayarlar.kayıt).send(`<@${db.fetch(`botlar.${id}.sahipid`)}> adlı kullanıcının **${db.fetch(`botlar.${id}.isim`)}** adlı botu onaylandı.`)

if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
client.users.get(db.fetch(`botlar.${id}.sahipid`)).send(`Merhaba, <@${db.fetch(`botlar.${id}.sahipid`)}> ${db.fetch(`botlar.${id}.isim`)} adlı botunuz ekibimiz tarafından onaylanmıştır.`)
}
  
});

app.get("/botyonetici/reddet/:botID", checkAuth, (req, res) => {
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
  renderTemplate(res, req, "reddet.ejs")

  
  
  
  
  app.get("/botyonetici/onayla/:botID", checkAuth, (req, res) => {
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
let id = req.params.botID

db.set(`botlar.${id}.durum`, 'Onaylı')

res.redirect("/yetkili")
                                                    
client.channels.get(client.ayarlar.kayıt).send(`<@${db.fetch(`botlar.${id}.sahipid`)}> adlı kullanıcının **${db.fetch(`botlar.${id}.isim`)}** adlı botu onaylandı.`)

if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
client.users.get(db.fetch(`botlar.${id}.sahipid`)).send(`Merhaba, <@${db.fetch(`botlar.${id}.sahipid`)}> ${db.fetch(`botlar.${id}.isim`)} adlı botunuz ekibimiz tarafından onaylanmıştır.`)
}
  
});
  

  app.post("/botyonetici/reddet/:botID", checkAuth, (req, res) => {
 if(!db.has(`yetkili.${req.user.id}.durum`) ) return res.redirect('/yetkili/hata')
  let id = req.params.botID
  

  
  res.redirect("/yetkili")

   client.channels.get("638324943133736971").send("<@" + db.fetch(`botlar.${id}.sahipid`) + "> adlı kullanıcının **" + db.fetch(`botlar.${id}.isim`) + "** adlı botu **" + req.body['red-sebep'] + "** sebebi ile reddedildi.");
      db.delete(`botlar.${id}`)
    
if (client.users.has(db.fetch(`botlar.${id}.sahipid`)) === true) {
client.users.get(db.fetch(`botlar.${id}.sahipid`)).send("<@ **" + req.body['red-id'] + "** adlı botunuz **" + req.body['red-sebep'] + "** sebebi ile reddedildi.");
}
  
    db.delete(`ser.${id}`)
  });
  
  

  
  

  
  
});
  
  
  

//API
  
app.get("/api/bots", (req, res) => {
  res.json({
    error: '{"https://discord.gg/86jN5Ap"}'
  });
});

app.get("/api/bots/:botID", (req, res) => {
   var id = req.params.botID

   if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       error: 'Bot bulunamadi.'
     });
   }
  }

    res.json({
       name: db.fetch(`botlar.${id}.isim`),
       id: id,
avatar: db.fetch(`botlar.${id}.avatar`),
prefix: db.fetch(`botlar.${id}.prefix`),
library: db.fetch(`botlar.${id}.kutuphane`),
owner: db.fetch(`botlar.${id}.sahip`),
ownerid: db.fetch(`botlar.${id}.sahipid`),
short_description: db.fetch(`botlar.${id}.kisaaciklama`),
long_description: db.fetch(`botlar.${id}.uzunaciklama`),
support_server: db.fetch(`botlar.${id}.destek`) || 'Not found!',    
vote_number: db.fetch(`botlar.${id}.oy`) || 0,
verified: db.fetch(`botlar.${id}.sertifika`) || 'Not found!'
    });
});
  
  app.get("/api/ser/:botID", (req, res) => {
   var id = req.params.botID

   if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       error: 'Bot not found.'
     });
   }
  }

    res.json({
       name: db.fetch(`ser.${id}.isim`),
       id: id,
avatar: db.fetch(`ser.${id}.avatar`),
owner: db.fetch(`ser.${id}.sahip`),
ownerid: db.fetch(`ser.${id}.sahipid`),
durum: db.fetch(`ser.${id}.durum`)
    });
});
  
  
  app.get("/api/user/:botID", (req, res) => {
   var id = req.params.botID

      if (db.has('user')) {
      if (Object.keys(db.fetch('user')).includes(id) === false) {
     res.json({
       error: 'User not found.'
     });
   }
  }
   
    res.json({
       bio: db.fetch(`user.${id}.bio`) || 'Not found!',
       background: db.fetch(`user.${id}.resim`) || 'Not found!',
       website: db.fetch(`user.${id}.site`) || 'Not found!'
    });
});
  
  
    app.get("/api/user/:botID/bots", (req, res) => {
   var id = req.params.botID

      if (db.has('user')) {
      if (Object.keys(db.fetch('user')).includes(id) === false) {
     res.json({
       error: 'User not found.'
     });
   }
  }
   
    res.json({
       bots: db.fetch(`kbotlar.${id}`) || 'Not found!',
    });
});

  
  app.get("/api/full", (req, res) => {
    res.json(Object.keys(db.fetch('botlar')));
  });
  
      app.get('/bot/:botID.png/widget', async (req, res) => {
         var id = req.params.botID

   if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       error: 'Bot bulunamadı.'
     });
   }
  }
      var owners = db.fetch(`botlar.${id}.sahip`)
      var oy = db.fetch(`botlar.${id}.oy`) || 0;
      var name = db.fetch(`botlar.${id}.isim`);
      var aciklama = db.fetch(`botlar.${id}.kisaaciklama`);
      var resim = db.fetch(`botlar.${id}.avatar`);
      var verified =  db.fetch(`botlar.${id}.sertifika`) || '';
      
  Canvas.registerFont(resolve(join(__dirname, "././dosya/widget/OpenSans-Bold.ttf")), "OpenSans-Bold");
  const template = await loadImage(`${process.cwd()}/src/dosya/img/widget/template.png`);
  const sertifika = await loadImage(`${process.cwd()}/src/dosya/img/widget/sertifika.png`)
      
  var avatar = await loadImage(`${resim}`)
  var bot = db.fetch(`botlar.${id}.sertifika`, "Bulunuyor")
  const widget = new Canvas(400, 180, "png")
  .addImage(template, 0, 0, 400, 180)
  .addRoundImage(avatar, 20, 40, 100, 100, 50, true)
  .setTextAlign('right')
  .setColor('#FFFFFF')
  .setTextFont('12px OpenSans-Bold') 
  .addText(`${name}`, 270, 20, 220)
  .setTextAlign('left')
  .setTextBaseline('top')
  .addText(owners, 160, 68, 300)
  .addText(oy, 162, 118, 260)
  if (db.fetch(`botlar.${id}.sertifika`)) widget.addImage(sertifika, 88, 108, 32, 32);
  res.set('Content-Type', 'image/png');
  res.send(await widget.toBuffer());
});
  
  
app.get("/api/bots/:botID/vote/:kullaniciID", (req, res) => {
  var id = req.params.botID
  var userr = req.params.kullaniciID

  if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       error: "Bot not found!"
     });
   }
  }
 
   res.json({
     oy_status: db.has(`oylar.${id}.${userr}`) ? `true` : `false`,
   });

});


    app.get("/api/bots/:botID/vote", (req, res) => {
  var id = req.params.botID
  var userr = req.params.kullaniciID

  if (db.has('botlar')) {
      if (Object.keys(db.fetch('botlar')).includes(id) === false) {
     res.json({
       error: 'Bot not found.'
     });
   }
  }
 
   res.json({
     votes: db.fetch(`botlar.${id}.oy`) || 0,
     hasVoted : db.fetch(`oylar.${id}`) || '',
   });

});

app.get('/api/status/:id', (req, res) => {
  client.fetchUser(req.params.id).then(user=>{
    var Durum = user.presence.status
    var Durm = (Durum == "online" ? "Online" : (Durum == "offline" ? "Offline" : (Durum == "idle" ? "İdle" : (Durum == "dnd" ? "Dnd" : "HATA"))))
  if (user) {
    res.send({
      durumu: Durm
    })
  } else {
    res.send({
      durumu: null
    })
  }
      }).catch(e=>{
        res.send({
      durumu: null
    })
  });
});
  



  

  app.get("/patreon", async (req, res) => {
  await res.redirect('https://www.patreon.com/');
});

  app.get("/discord", async (req, res) => {
  await res.redirect('https://discord.gg/xU8Vxbh');
});
  
    app.get("/botyonetici/sertifikaonayla/:botID", checkAuth, (req, res) => {
 if(!client.yetkililer == req.user.id) return res.redirect('/yetkili/hata')

let id = req.params.botID
let owneridd = db.fetch(`botlar.${id}.sahipid`)

res.redirect("/yetkili")
                                                    
  db.set(`botlar.${id}.sertifika`, "Bulunuyor")
  db.delete(`ser.${id}`)
  db.set(`sertifikak.${owneridd}.durum`, "Bulunuyor")
    
    client.channels.get(client.ayarlar.kayıt).send(`**<@${db.fetch(`botlar.${id}.sahipid`)}>** adlı kullanıcının **${db.fetch(`botlar.${id}.isim`)}** adlı botun sertifika isteği onaylandı.`)
});
  
  
        app.get("/yetkili-sers", checkAuth, (req, res) => {

  
 if(!client.yetkililer == req.user.id) return res.redirect('/yetkili/hata')
   
  
renderTemplate(res, req, "y-panel-serr.ejs") 
});

app.get("/botyonetici/sertifikareddet/:botID", checkAuth, (req, res) => {
 if(!client.yetkililer == req.user.id) return res.redirect('/yetkili/hata')

  let id = req.params.botID
  
    db.delete(`botlar.${id}.sertifika`)
  
    db.delete(`sertifikak.${id}.durum`)
  db.delete(`ser.${id}`) 
  
  res.redirect("/yetkili")
  
      client.channels.get(client.ayarlar.kayıt).send(`**${db.fetch(`botlar.${id}.isim`)}** adlı botun sertifika isteği reddedildi!`)

  });

  app.get("/botyonetici/sertifikasil/:botID", checkAuth, (req, res) => {
  if(!client.yetkililer == req.user.id) return res.redirect('/yetkili/hata')

  let id = req.params.botID

    db.delete(`botlar.${id}.sertifika`)
  
    db.delete(`sertifikak.${id}.durum`)
  
  db.delete(`ser.${id}`) 
  
  res.redirect("/yetkili")
  
      client.channels.get(client.ayarlar.kayıt).send(`**${db.fetch(`botlar.${id}.isim`)}** adlı botun sertifikası alındı!`)

  });
   app.get("/sertifika", checkAuth, (req, res) => { // BOT SAYFASI
 
  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "verification.ejs", {kisi})
    };
  });
});
  

  app.get("/sertifika/onayla/:botID", checkAuth, (req, res) => {

var id = req.params.botID
 var sahip = db.fetch(`botlar.${id}.sahip`);
 var beklemede = db.fetch(`ser.${id}.durum`)
 if (beklemede == "Beklemede") return renderTemplate(res, req, "hataaaee1.ejs")
 if (!sahip == req.user.id) return renderTemplate(res, req, "hataaae.ejs") 
 if (db.fetch(`botlar.${id}.sertifika`) == "Bulunuyor") return renderTemplate(res, req, "hataaaee.ejs")
 
       renderTemplate(res, req, "verificationss.ejs", {id})


    
});

  
app.post("/sertifika/onayla/:botID", checkAuth, (req, res) => {

let ayar = req.body
let ID = req.params.botID
let s = req.user.id

  
  var name = db.fetch(`botlar.${ID}.isim`);
  var sahip = db.fetch(`botlar.${ID}.sahip`);
    var sahipid = db.fetch(`botlar.${ID}.sahipid`);

request({
url: `https://discordapp.com/api/v7/users/${ID}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sistem = JSON.parse(body)

db.set(`ser.${ID}.isim`, `${name}`)

db.set(`ser.${ID}.avatar`, `https://cdn.discordapp.com/avatars/${sistem.id}/${sistem.avatar}.png`)
    db.set(`ser.${ID}.id`, ID)
    db.set(`ser.${ID}.durum`, 'Beklemede')
  
request({
url: `https://discordapp.com/api/v7/users/${req.user.id}`,
headers: {
"Authorization": `Bot ${process.env.TOKEN}`
},
}, function(error, response, body) {
if (error) return console.log(error)
else if (!error) {
var sahip = JSON.parse(body)
res.redirect("/");

}})
}})
  
  
client.channels.get(client.ayarlar.kayıt).send(`<@${req.user.id}> adlı kullanıcı **${name}** adlı botu için sertifika doğrulaması talep etti. | Yetkili ekibi kısa süre içersinde onay verecektir / vermeyecektir.`)
  
  
});
  
app.get("/sertifika/:userID", checkAuth, (req, res) => {

  request({
    url: `https://discordapp.com/api/v7/users/${req.params.userID}`,
    headers: {
      "Authorization": `Bot ${process.env.TOKEN}`
    },
  }, function(error, response, body) {
    if (error) return console.log(error)
    else if (!error) {
      var kisi = JSON.parse(body)

      renderTemplate(res, req, "verifications.ejs", {kisi})
    };
  });

});  

  
 // PORT
  app.listen(3000);
};
 


