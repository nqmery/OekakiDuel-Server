const crypto = require('crypto');
const express = require('express');
const { createServer } = require('http');
const { send } = require('process');
const WebSocket = require('ws');
const app = express();
const port = 3000;
let serialNumber = 0;//通し番号
const server = createServer(app);
const wss = new WebSocket.Server({ server });
const cards = Array(10); 
let flag = 0; //0:画像未送信、1:画像送信済み
roundnum = 20;      // 現在ラウンド数
//あとでインスタンス化
class Player {
  constructor(id,ip,hp) {
    this.ip = ip;
    this.id = id;
    hp = 200;//とりあえず50
  }
}


Player1 = new Player(0, 1, 200); //プレイヤー１のインスタンス初期値
Player2 = new Player(1, 1, 200); //プレイヤー２のインスタンス初期値

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
cards1 = Card[5];  //プレイヤー１のカード合計枚数
cards2 = Card[5];  //プレイヤー２のカード合計枚数
class Effect{
  constructor(effID){
    this.effID = effID;//効果のID
  }
  effectActive(){
    //効果の発動
    switch(this.effID){
      case 1:
        //効果１
        break;
      case 2:
        //効果２
        break;
      case 3:
        //効果３
        break;
      case 4:
        //効果４
        break;
      case 5:
        //効果５
        break;
      case 6:
        //効果６
        break;
      case 7:
        //効果７
        break;
      case 8:
        //効果８
        break;
      case 9:
        //効果９
        break;
      case 10:
        //効果１０
        break;
      default:
        //効果なし
        break;
    }
  }
}




wss.on('connection', function(ws) {//クライアントが接続してきたときの処理
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


    ws.on('message', function(message) {//クライアントからメッセージを受信したときの処理
        console.log('received: %s', message);
        const buffer = new ArrayBuffer(9);
        const view = new DataView(buffer);
        console.log("message",message);
        view.setUint8(0, message); // 信号の種類
        ws.send('received: ' + message);
    });

    ws.on('close', function() {
        console.log("client left.");
        });
});

server.listen(port, function() {
  console.log('Listening on http://localhost:${port}');
});

function BinaryTranslation(Array){//信号を元に戻す これいらないかも
  len = Array.length;
  if(len == 9 && Array[0] >= 30){//戦闘中の信号
    result = [9];//
    
    return result;
  }else{//

  }
}

function sendBinaryData(ws,send_data){//信号をバイナリに変換して送信
  const buffer = new ArrayBuffer(9);
  const view = new DataView(buffer);
  if (send_data[0] == 30) { // ターン数の送信
    view.setUint8(0, send_data[0]); // 信号の種類
    view.setUint8(1, serialNumber++); // 命令の通し番号
    view.setUint8(2, send_data[2]); // ターン数
  } else if (send_data[0] == 31) { // カードの開示
    view.setUint8(0, send_data[0]); // 信号の種類
    view.setUint8(1, serialNumber++); // 命令の通し番号
    view.setUint8(2, send_data[2]); // プレイヤーID
    view.setUint8(3, send_data[3]); // カード番号
  } else if (send_data[0] == 32) { // ダメージの送信
    view.setUint8(0, send_data[0]); // 信号の種類
    view.setUint8(1, serialNumber++); // 命令の通し番号
    view.setUint8(2, send_data[2]); // ダメージ量
    view.setUint8(3, send_data[3]); // 攻撃プレイヤーID
    view.setUint8(4, send_data[4]); // 被攻撃プレイヤーID
    const specialEffect = send_data[5]; // 16ビットの特殊効果番号
    // 上位バイトと下位バイトを抽出
    const highByteEff = (specialEffect >> 8) & 0xFF; // 上位バイト
    const lowByteEff = specialEffect & 0xFF; // 下位バイト
    view.setUint8(5, highByteEff); // 特殊効果番号の上位バイトを格納
    view.setUint8(6, lowByteEff); // 特殊効果番号の下位バイトを格納
    const recentHP = send_data[6]; // hpの関係量
    const highByteHP = (recentHP >> 8) & 0xFF; // 上位バイト
    const lowByteHP = recentHP & 0xFF; // 下位バイト
    view.setUint8(6, highByteHP); // 特殊効果番号の上位バイトを格納
    view.setUint8(7, lowByteHP); // 特殊効果番号の下位バイトを格納
  }
  console.log("send_data",buffer); 
  serialNumber++;
  ws.send(buffer);
}