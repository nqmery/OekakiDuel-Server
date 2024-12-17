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
roundnum = 0;      // 現在ラウンド数
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


  send_data =[3];//ターン数の送信
  send_data[0] = 30;
  send_data[1] = serialNumber;
  send_data[2] = roundnum;
  sendBinaryData(ws,send_data);
  
  ws.on('message', function(data) {//クライアントからメッセージを受信したときの処理
    concole.log("現在のターン数",roundnum);
    //カード情報の保存
    if (typeof(data) === binaryType) {
      if(data){
      // client sent a string
      const byte = new Uint8Array(data);
      console.log("string received from client -> '" + data + "'");
      ws.send("[Server]string received from client -> '" + data + "'");

      cards[0] = new Card(1,1,50,50,50,50); //例クライアント１が選択したカード
      cards[1] = new Card(1,2,23,23,23,23); //例クライアント２が選択したカード、どうやってクライアントを区別するんだっけ
      }

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
      for(let i = 0; i < cards.length; i++){
        //プレイヤー１が選択したカード
        if(byte[3] === cards[i].player && cards[i].player === 0 && byte[4] === cards[i].id){
           SelectCard1 = cards[i];
        }
        //プレイヤー２が選択したカード
        if(byte[3] === cards[i].player && cards[i].player === 1 && byte[4] === cards[i].id){
           SelectCard2 = cards[i];
        }
      }
    }
    
    if(byte[0] === 32 && roundnum <= 5){
    //特殊効果発動順序
    if(SelectCard1.spd > SelectCard2.spd){
      if(byte[5] === 0){
        BattleFlow();
      }
      //確実に先制攻撃
      if(byte[5] === 1){
        if(SelectCard1.player === byte[3]){
          SelectCard2.spd = 0;
        }else{
          SelectCard1.spd = 0;
        }
      }
      //相手の攻撃無効化
      if(byte[5] === 2){
        if(SelectCard1.player === byte[3]){
          SelectCard2.atk = 0;
        }else{
          SelectCard1.atk = 0;
        }
      }
    }
    
      function  BattleFlow(){
      //カードの速さを比較
      if(SelectCard1.spd > SelectCard2.spd){
        //先にプレイヤー１が攻撃
        BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp); 
        BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp); 
        //後からプレイヤー２が攻撃
        BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
        BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
      } else {
        //先にプレイヤー２が攻撃
        BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
        BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
        //後からプレイヤー１が攻撃
        BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp);
      }
    }
    }

      // バトル中のダメージ計算
      function BattleCalc(playernum, atknum, defnum, hpnum){
        
        //負の値にならないようにして計算結果を定義
        Damagevalue = Math.max(defnum - atknum, 0); 
        //HPの更新
        hpnum = Math.max(hpnum - Damagevalue, 0);
        //クラスインスタンスHPの変更
        //クラスインスタンスHPの変更
        if(playernum === 0){
          Player1.hp = hpnum;
          Player1.hp = hpnum;
        }
        else if (playernum === 1){
          Player2.hp = hpnum;
          Player2.hp = hpnum;
        }
        //更新したHPをJOSN形式で送る
         response = {
          type: 'damage_result', //タイプを追加するかは相談
          player: playernum,
          hp: hpnum
        }
        response[0] = 32;
        response[1] = serialNumber;
        response[2] = playernum;//プレイヤーのID
        response[3] = playernum;//HP
        ws.send(JSON.stringify(response)); //オブジェクト遅れないからバイナリにしないといけないかも
      }
      
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
  }
  serialNumber++;
  ws.send(buffer);
}