const crypto = require('crypto');
const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

const server = createServer(app);
const wss = new WebSocket.Server({ server });
cards1 = Card[5];  //プレイヤー１のカード合計枚数
cards2 = Card[5];  //プレイヤー２のカード合計枚数
roundnum = 0;      // 現在ラウンド数

//あとでインスタンス化
class Player {
  constructor(id,ip,hp) {
    this.ip = ip;
    this.id = id;
   //持たなくていいかも this.cards = Card[5];
    this.hp = hp;//とりあえず50
  }
}

Player1 = new Player(0, 1, 200); //プレイヤー１のインスタンス
Player2 = new Player(1, 1, 200); //プレイヤー２のインスタンス

class Card{
  constructor(id,player,def,atk,spd,eff){
    this.player = player;//どっちのプレイヤーのカードか
    this.id = id;//カード番号
    this.def = def;//防御力
    this.atk = atk;//攻撃力
    this.spd = spd;//速さ
    this.eff = eff;//効果
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
      if(data)
      // client sent a string
      console.log("string received from client -> '" + data + "'");
      ws.send("[Server]string received from client -> '" + data + "'");

      SelectCard1 = new Card(1,1,50,50,50,50); //クライアント１が選択したカード
      SelectCard2 = new Card(1,2,23,23,23,23); //クライアント２が選択したカード、どうやってクライアントを区別するんだっけ

    } else {
      console.log("binary received from client -> " + Array.from(data).join(", ") + "");
      ws.send("[Server]binary received from client -> " + Array.from(data).join(", ") + "");
    }

    //現在ターン数の確認してターン開始
    if(byte[0]===30 && roundnum <= 5) {
      roundnum = byte[2];
    }
    
    //選んだカードの開示
    if(byte[0] === 31 && roundnum <= 5){
      for(i = 0; i < cards.length; i++){
        //プレイヤー１が選択したカード
        if(byte[3] === Card[i+1].player === 0 && byte[4] === Card[i+1].id){
           SelectCard1 = Card[i+1];
        }
        //プレイヤー２が選択したカード
        if(byte[3] === Card[i+1].player === 1 && byte[4] === Card[i+1].id){
           SelectCard2 = Card[i+1];
        }
      }
    }

      //カードの速さを比較
      if(SelectCard1.spd > SelectCard2.spd){
        //先にプレイヤー１が攻撃
        BattleFlow(SelectCard2.player, SelectCard1.atk, SelectCard2.def); 
        //後からプレイヤー２が攻撃
        BattleFlow(SelectCard1.player, SelectCard2.atk, SelectCard1.def);
      } else {
        //先にプレイヤー２が攻撃
        BattleFlow(SelectCard1.player, SelectCard2.atk, SelectCard1.def);
        //後からプレイヤー１が攻撃
        BattleFlow(SelectCard2.player, SelectCard1.atk, SelectCard2.def);
      }

      // バトル中の処理
      function BattleFlow(playernum, atknum, defnum, hpnum){
        
        //負の値にならないようにして計算結果を定義
        Damagevalue = Math.max(defnum - atknum, 0); 
        //HPの更新
        hpnum = Math.max(hpnum - Damagevalue, 0);
        //更新したHPを送る
         response = {
          type: 'damage_result', //タイプを追加するかは相談
          player: playernum,
          hp: HP
        }
        ws.send(response); //オブジェクト遅れないからバイナリにしないといけないかも
      }
  });


  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log('Listening on http://localhost:${port}');
});