const Discord = require('discord.js')
const config = require('./config.json')
const client = new Discord.Client()
const prefix = '$'
const mysql = require('mysql')
const con = mysql.createConnection({  
   host: config.host,  
   user: config.user,  
   password: config.password,
   database: config.database
});

const five_stars = ['Jean', 'Diluc', 'Venti', 'Klee', 'Mona', 'Xiao', 'Qiqi', 'Keqing']
const four_stars = ['Amber', 'Lisa', 'Kaeya', 'Barbara', 'Razor', 'Bennett', 'Noelle', 'Fischl', 'Sucrose', 'Beidou', 'Ningguang', 'Xiangling', 'Xingqiu', 'Chongyun']
const three_stars = ['Weapon 1', 'Weapon 2', 'Weapon 3', 'Weapon 4', 'Weapon 5', 'Weapon 6', 'Weapon 7', 'Weapon 8', 'Weapon 9', 'Weapon 10', 'Weapon 11', 'Weapon 12', 'Weapon 13', 'Weapon 14', 'Weapon 15']
const five_stars_picture = [
   'img/jean.jpg',
   'img/diluc.jpg',
   'img/venti.jpg',
   'img/klee.jpg',
   'img/mona.jpg',
   'img/xiao.jpg',
   'img/qiqi.jpg',
   'img/keqing.jpg',
]

const four_stars_picture = [
   'img/amber.jpg',
   'img/lisa.jpg',
   'img/kaeya.jpg',
   'img/barbara.jpg',
   'img/razor.jpg',
   'img/bennett.jpg',
   'img/noelle.jpg',
   'img/fischl',
   'img/sucrose.jpg',
   'img/beidou.jpg',
   'img/ningguang.jpg',
   'img/xiangling.jpg',
   'img/xingqiu.jpg',
   'img/chongyun.jpg',
]

const three_stars_picture = 'img/weapon.jpg'
client.on('message', function(message) {
   // console.log(message)
   if(message.author.bot) return;
   if(!message.content.startsWith(prefix)) {
      con.query("SELECT * FROM setting WHERE idx = ?", ['channel'], function(err, res) {
         if(err) console.log(err)
         if(res != '') {
            if(res[0].value == message.channel.id) {
               con.query("SELECT * FROM users WHERE user_id = ?", [message.author.id], function(err, res) {
                  if(err) console.log(err)
                  if(res != '') {
                     let points  = parseInt(res[0].points) + 10;
                     con.query("UPDATE users SET points = ? WHERE user_id = ?", [points, message.author.id], function(err, upd) {
                        if(err) console.log(err)
                        if(upd) console.log('add 5 points')
                        return;
                     })
                  }
               })
            }
         }
      })
   }

   const commandBody = message.content.slice(prefix.length)
   const args = commandBody.split(' ')
   const command = args.shift().toLowerCase()

   if(command == 'ping') {
      const timeTaken = Date.now() - message.createdTimestamp
      message.reply(`${timeTaken} ms`)
   }

   if(command == 'setting') {
      if(args[0] == 'channel') {
         let set_channel = args[1].split('#')
         set_channel = set_channel[1].split('>')
         set_channel = set_channel[0]
         con.query("SELECT * FROM setting WHERE idx = ?", ['channel'], function(err, res) {
            if(err) console.log(err)
            if(res != '') {
               con.query("UPDATE setting SET value = ? WHERE idx = 'channel'", [set_channel], function(err, upd) {
                  if(err) console.log(err)
                  if(upd) message.channel.send(`Update to channel ${args[1]}`)
               })
            }else{
               con.query("INSERT INTO setting (idx, value) VALUES ('channel', ?)", [set_channel], function(err, res) {
                  if(err) console.log(err)
                  if(res) {
                     message.channel.send(`Create to channel ${args[1]}`)
                  }
               })
            }
         })
         return;
      }
   }

   if(command == 'register') {
      let sql = "SELECT * FROM users WHERE user_id = ?"
      con.query(sql, [message.author.id], function (err, result) {
         if(err) throw err;
         if(result != '') {
            message.reply('You are already registered!!')
            return;
         }
         sql = "INSERT INTO users (user_id, username, discriminator, points) VALUES (?, ?, ?, ?)"
         con.query(sql, [message.author.id, message.author.username, message.author.discriminator, 0], function(err, result) {
            if(err) throw err;
            if(result) {
               message.reply('You have successfully registered! Current points: 0. Every chat you make on this server will add 5 points')
               return;
            }
         })
      })
   }

   if(command == 'points') {
      let sql = "SELECT * FROM users WHERE user_id = ?"
      con.query(sql, [message.author.id], function (err, result) {
         if(err) throw err;
         if(result != '') {
            message.reply(`Your current point is ${result[0].points}`)
            return;
         }
         message.reply('You have to register first. type $register to register your account')
      })
   }

   if(command == 'roll') {
      con.query("SELECT * FROM users WHERE user_id = ?", [message.author.id], function(err, res) {
         if(err) console.log(err)
         if(res != '') {
            if(res[0].points >= 50) {
               const getNumber = roll()
               let msg = ''
               let files = ''
               let character = ''
               switch(getNumber[0]) {
                  case 5:
                     character = five_stars[getNumber[1]]
                     msg = `You Got ${five_stars[getNumber[1]]} :star: :star: :star: :star: :star:`
                     files = five_stars_picture[getNumber[1]]
                     break;
                  case 4:
                     character = four_stars[getNumber[1]]
                     msg = `You Got ${four_stars[getNumber[1]]} :star: :star: :star: :star:`
                     files = four_stars_picture[getNumber[1]]
                     break;
                  default:
                     msg = `You Got ${three_stars[getNumber[1]]} :star: :star: :star:`
                     files = three_stars_picture
                     break;
               }
               message.channel.send(msg, {
                  files: [files]
               })
               let points = parseInt(res[0].points) - 100
               con.query("UPDATE users SET points = ? WHERE user_id = ?", [points, message.author.id], function(err, res) {   //update points
                  if(err) console.log(err)
                  if(res) console.log(res)
               })
               con.query("SELECT * FROM gacha_result WHERE user_id = ? AND stars = ? AND idx = ?", [message.author.id, getNumber[0], getNumber[1]], function(err, res) {
                  if(err) console.log(err)
                  if(res != '') {
                     let constellation = parseInt(res[0].constellation) + 1;
                     con.query("UPDATE gacha_result SET constellation = ? WHERE user_id = ? AND stars = ? AND idx = ?", [constellation,message.author.id, getNumber[0], getNumber[1]], function(err, upd) {
                        if(err) console.log(err)
                        if(upd) message.channel.send(`Add constellation to character ${character}`)
                     })
                     return;
                  }else{
                     con.query("INSERT INTO gacha_result (user_id, stars, idx, constellation) VALUES (?, ?, ?, 0)", [message.author.id, getNumber[0], getNumber[1]], function(err, res) {
                        if(err) console.log(err)
                        if(res) console.log('add new character')
                     })
                     return;
                  }
               })
               return;
            }else{
               message.reply('insufficient points. You need at least 100 points')
               return;
            }
         }else{
            message.reply('You have to register first. type $register to register your account')
            return;
         }
      })
   }

   if(command == 'help') {
      con.query("SELECT * FROM setting WHERE idx = ?", ['channel'], function(err, res) {
         if(err) console.log(err)
         if(res) {
            var msg = "Welcome to Gacha Bot!\r\n"
            msg += "My prefix is $\r\n"
            msg += "Command list :\r\n"
            msg += "$register : Register your account\r\n"
            msg += "$points : Check your points\r\n"
            msg += "$roll : Try your luck. Roll 1 time\r\n"
            msg += `Note: You need at least 100 Points to use $roll command. To earn points, you can chat on <#${res[0].value}> (Alert: DON'T SPAM!!!)`
            message.channel.send(msg)
         }
      })
      

   }
})

client.login(config.BOT_TOKEN)

function roll() {
   const number = (Math.floor(Math.random() * 1000) + 1) * 0.1
   if(number <= 1) {
      const random = Math.floor(Math.random() * five_stars.length)
      return [5, random]
      // return `You got ${five_stars[random]} :star: :star: :star: :star: :star:`
   }else
   if(number <= 20) {
      const random = Math.floor(Math.random() * four_stars.length)
      return [4, random]
      // return `You got ${four_stars[random]} :star: :star: :star: :star:`
   }else
   if(number <= 60) {
      const random = Math.floor(Math.random() * three_stars.length)
      return [3, random]
      // return `You got ${three_stars[random]} :star: :star: :star:`
   }else
   if(number <= 100) {
      const random = Math.floor(Math.random() * three_stars.length)
      return [3, random]
      // return `You got ${three_stars[random]} :star: :star: :star:`
   }
}