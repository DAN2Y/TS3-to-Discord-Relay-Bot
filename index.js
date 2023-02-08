#!/usr/bin/env node

const { TeamSpeak } = require("ts3-nodejs-library")
require('dotenv').config();

//Discord

var Discord = require('discord.js');
var bot = new Discord.Client();
var feed_channel;
var status_channel;
var dateFormat = require('dateformat');
const TOKEN = "";
var users = []
var userString;

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
  feed_channel = bot.channels.get("778031078655918102");
  status_channel = bot.channels.get("778051947781292033");
  general_channel = bot.channels.get("584463776942653468");
});


//TeamSpeak

const teamspeak = new TeamSpeak({
  host: "127.0.0.1",
  queryport: 10011, //optional
  serverport: 9987,
  username: "teamhuan",
  password: "******",
  nickname: "TeamHUAN Bot"
})

teamspeak.on("ready", () => {
  console.log("connected to ts3")
  moveQuery("Waiting for peeps")
})

teamspeak.on("clientconnect", async () => {
  updateUsers()
})

teamspeak.on("clientdisconnect", async () => {
  updateUsers()
})

teamspeak.on("error", err => {
  console.error(err)
})

teamspeak.on("textmessage", ev => {
  console.log(ev.msg)
  time = dateFormat(new Date(), "HH:MM");
  feed_channel.send(time + ` __**${ev.invoker.nickname}**__: `+ checkMsg(ev.msg))   
})

function checkMsg(url){
  if (url.includes("[URL]")){
    return url.slice(5,url.length-6)
  } else {
    return url
  }
}

async function updateUsers() {
  users.length = 0
  userString = ""

  const clients = await teamspeak.clientList({ clientType: 0 })
   clients.forEach(client => {
     users.push(client.nickname)
     userString += client.nickname + "\n"
   })
   if (users.length>0){
    feed_channel.fetchMessage("778178061123452979").then(msg => msg.edit("__**Derzeit online:**__\n" + userString));
    general_channel.fetchMessage("778205798543130634").then(msg => msg.edit("__**Derzeit online:**__\n" + userString));
   } else {
    feed_channel.fetchMessage("778178061123452979").then(msg => msg.edit("**Niemand online!**"));
    general_channel.fetchMessage("778205798543130634").then(msg => msg.edit("**Niemand online!**"));   
  }
}

   function moveQuery(channelName) {
    teamspeak.whoami().then(me => {                           //
      teamspeak.channelFind(channelName).then(c => {          // 
          teamspeak.clientMove(me.clientId, c[0].cid).then(); // Move Query to channelName channel when connected
      });                                                     //
    });
  }
