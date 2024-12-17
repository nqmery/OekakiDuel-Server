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
    hp = 200;//とりあえず50
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
  //オブジェクト変数にする？そしたら変数に代入せずに計算できるかも
  //攻撃変数を呼び出し
  get atkValue() {
    return this.atk;
  }
  //防御変数を呼び出し
  get defValue() {
    return this.def;
  }
  //機動力変数を呼び出し
  get spdValue() {
    return this.spd;
  } 
  //プレイヤー番号の呼び出し
  get playerValue(){
    return this.player;
  }
  //カード番号の呼び出し
  get cardIDValue(){
    return this.id;
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

      Card[0] = new Card(1,1,50,50,50,50); //クライアント１が選択したカード
      Card[1] = new Card(1,2,23,23,23,23); //クライアント２が選択したカード、どうやってクライアントを区別するんだっけ

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
        if(byte[3] === Card[i+1].playerValue === 0 && byte[4] === Card[i+1].cardIDValue){
           SelectCardByPlayer1 = Card[i+1];
        }
        //プレイヤー２が選択したカード
        if(byte[3] === Card[i+1].playerValue === 1 && byte[4] === Card[i+1].cardIDValue){
           SelectCardByPlayer2 = Card[i+1];
        }
      }
    }


      //カードの素早さを定義
      //例として配列の番号をハードコートしているがクライアントから受け取った変数を使うと思う
      //定義せずに直接card[0].~を使うほうがいいかもしれないがいまはクライアントの見分けをするために定義する
      spd1 = Card[0].spdValue
      spd2 = Card[1].spdValue

      //カードの速さを比較
      if(spd1 > spd2){

        BattleFlow(Card[1].playerValue, Card[0].atkValue, Card[1].defValue);

        BattleFlow(Card[0].playerValue, Card[1].atkValue, Card[0].defValue);
      } else {

        BattleFlow(Card[0].playerValue, Card[1].atkValue, Card[0].defValue);

        BattleFlow(Card[1].playerValue, Card[0].atkValue, Card[1].defValue);
       
      }

      // バトル中の処理
      function BattleFlow(playernum, atknum, defnum){
        
        //負の値にならないようにして計算結果を定義
        Damagevalue = Math.max(defnum - atknum, 0); 
        //HPの更新
        HP = Math.max(HP - Damagevalue, 0);
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