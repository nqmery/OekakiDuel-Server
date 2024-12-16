const crypto = require('crypto');
const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

const server = createServer(app);
const wss = new WebSocket.Server({ server });
cards = Card[5];  //カードの合計枚数

//あとでインスタンス化
class Player {
  constructor(id,ip,hp) {
    this.ip = ip;
    this.id = id;
   //持たなくていいかも this.cards = Card[5];
    hp = 200;//とりあえず50
  }
}

class Card{
  constructor(id,player,def,atk,spd,eff){
    this.player = player;//どっちのプレイヤーのカードか
    this.id = id;//カード番号
    this.def = def;//防御力
    this.atk = atk;//攻撃力
    this.spd = spd;//速さ
    this.eff = eff;//効果
  }
  //オブジェクト変数にする？そしたら変数に代入せずに計算できるかも
  //攻撃変数を呼び出し
  get atkValue() {
    return this.atk;
  }
  //防御変数を呼び出し
  get defValue() {
    return this.atk;
  }
  //機動力変数を呼び出し
  get spdValue() {
    return this.atk;
  } 

}


wss.on('connection', function(ws, req) {
  console.log("client joined.");
  // send "hello world" interval
  //const textInterval = setInterval(() => ws.send("hello world!"), 100);
  // send random bytes interval
  //const binaryInterval = setInterval(() => ws.send(crypto.randomBytes(8).buffer), 110);

  ws.on('message', function(data) {

    //カード情報の保存
    if (typeof(data) === "初期設定") {
      // client sent a string
      console.log("string received from client -> '" + data + "'");
      ws.send("[Server]string received from client -> '" + data + "'");

      Card[0] = new Card(1,1,50,50,50,50); //クライアント１が選択したカード
      Card[1] = new Card(1,2,23,23,23,23); //クライアント２が選択したカード、どうやってクライアントを区別するんだっけ

    } else {
      console.log("binary received from client -> " + Array.from(data).join(", ") + "");
      ws.send("[Server]binary received from client -> " + Array.from(data).join(", ") + "");
    }

    //毎ターン行う通信
    if (message.type === '毎ターンごとに通信する') {

      //カードの素早さを定義
      //例として配列の番号をハードコートしているがクライアントから受け取った変数を使うと思う
      spd1 = Card[0].spdValue
      spd2 = Card[1].spdValue

      //カードの速さを比較
      if(spd1 > spd2){

        //負の値にならないようにして計算結果を定義
        Damagevalue = Math.max(Card[1].atkValue - Card[0].defValue, 0); 
        //HPの更新
        HP = Math.max(HP - Damagevalue, 0);
        //更新したHPを送る
        const response = {
          type: 'damage_result', //タイプを追加するかは相談
          id: 2,
          hp: Damagevalue,
        }
        ws.send(response); //オブジェクト遅れないからバイナリにしないといけないかも
      
      }else{
        //負の値にならないようにして計算結果を定義
        Damagevalue = Math.max(Card[0].atkValue - Card[1].defValue, 0); 
        const response = {
          type: 'damage_result', 
          damage: Damagevalue,
        }
        ws.send(response); 
      }

      
      // バトル中の処理
      const { attackerAtk, defenderDef } = message;
      if (typeof attackerAtk === 'number' && typeof defenderDef === 'number') {
        const damage = Math.max(attackerAtk - defenderDef, 0); // Prevent negative damage
        const response = {
          type: 'damage_result',
          damage: damage,
        };
        
      } else {
        
      }
  }});


  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log('Listening on http://localhost:${port}');
});