const crypto = require('crypto');
const express = require('express');
const { createServer } = require('http');
const { send } = require('process');
const WebSocket = require('ws');
const app = express();
const port = 3000;
serialNumber = 0;//通し番号
const server = createServer(app);
const wss = new WebSocket.Server({ server });
flag = 0;//0:画像未送信、1:画像送信済み
class Player {
  constructor(id,ip) {
    this.ip = ip;
    this.id = id;
    this.cards = Card[5];
    hp = 200;//とりあえず50
  }
}

class Card{
  constructor(id,player,def,atk,spd,effID){
    this.player = player;//どっちのプレイヤーのカードか
    this.id = id;//カード番号
    this.def = def;//防御力
    this.atk = atk;//攻撃力
    this.spd = spd;//速さ
    this.eff = new Effect(effID);//効果
  }
}

class Effect{
  constructor(effID){
    this.effID = effID;//効果の発動タイミング
    
  }

}




wss.on('connection', function(ws) {
  console.log("client joined.");

  // send "hello world" interval
  //const textInterval = setInterval(() => ws.send("hello world!"), 100);
  /*
  ここに画像の送信処理を書く
  if(flag == 0){
  }

  */

  // send random bytes interval
  //const binaryInterval = setInterval(() => ws.send(crypto.randomBytes(8).buffer), 110);
  ws.on('message', function(data) {
    if (typeof(data) === "string") {
      // client sent a string
      console.log("string received from client -> '" + data + "'");
      ws.send("[Server]string received from client -> '" + data + "'");

    } else {
      console.log("binary received from client -> " + Array.from(data).join(", ") + "");
      ws.send("[Server]binary received from client -> " + Array.from(data).join(", ") + "");
    }
  });

  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`);
});

function BinaryTranslation(Array){//信号を元に戻す
  len = Array.length;
  if(len == 9 && Array[0] >= 30){//戦闘中の信号
    result = [9];//
    
    return result;
  }else{//

  }
}

function ToranslationToBinary(send_data){//信号をバイナリに変換
  send_data_binary = [];
  send_data_binary[0] = 0;//通信種別 
  return send_data_binary;
}