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
let flag = 1; //0:画像未送信、1:画像送信済み
roundnum = 20;      // 現在ラウンド数
let turnManege = 0;   // 1ターンのどこに該当するかを保持する
/*
0:ターン開始処理
1:カード選択処理
2:バトル前特殊効果
3:バトル処理　早いほう
4:バトル処理　遅いほう
5:バトル後特殊効果
6:ターン終了処理 +特殊効果がある場合は清算

*/
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
    this.player = player;//どっちのプレイヤーのカードか このパラメータ使わないかも　cards配列で管理するから
    this.id = id;//カード番号
    this.def = def;//防御力
    this.atk = atk;//攻撃力
    this.spd = spd;//速さ
    this.eff = new Effect(effID);//効果
  }
}
const cards  = Array.from({ length: 2 }, () => Array(5));//こっちの方がかんりしやすい
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
  const responsetest = new ArrayBuffer(3);
  const view = new DataView(responsetest);
  view.setUint8(0, 30);
  view.setUint8(1, 12);
  view.setUint8(2, 20);
  ws.send(responsetest);

  ws.on('message', function(data) {//クライアントからメッセージを受信したときの処理
    if(flag == 0){//画像の送受信用 マッチング処理もあった...
      //画像の受信
      //画像の受信が完了したらflag = 1にする
    }else{//以下に
      //テスト用
      const useData = BinaryTranslation(data);
      for(let i = 0; i < useData.length; i++){
        console.log("バイナリデータ",useData[i]);
      }
      //通信種別による関数の呼び出し
      switch(useData[0]){//種別に応じて関数を呼び出す
        case 1:
          break;
        case 30:

          break;
        case 36://選択カードの受信と選択カードの開示
          let selectedCard = CardSelect(useData);
          let pid = useData[2];//プレイヤーID 0 or 1
          let send_data = [31, serialNumber, pid, selectedCard.id];
          sendBinaryData(ws,send_data);
          break;
      }

    }
  });
  ws.on('close', function() {
    console.log("client left.");
  });
});

server.listen(port, function() {
  console.log('Listening on http://localhost:${port}');
});

function BinaryTranslation(recv_data){//信号を元に戻す どう考えてもいるわこれ
  const dataset = new Uint8Array(recv_data);
  console.log("binary received from client -> " + Array.from(recv_data).join(", ") + "");
  console.log("バイナリデータ",dataset);
  return dataset;

}

function sendBinaryData(ws,send_data){//信号をバイナリに変換して送信
  const buffer = new ArrayBuffer(9);
  const view = new DataView(buffer);
  //ここは共通の処理
  view.setUint8(0, send_data[0]); // 信号の種類
  view.setUint8(1, serialNumber++); // 命令の通し番号
  //通信種別による処理
  switch (send_data[0]){// ターン数の送信
    case 30:
      view.setUint8(2, send_data[2]); // ターン数
      break;
    case 31:
      view.setUint8(2, send_data[2]); // プレイヤーID
      view.setUint8(3, send_data[3]); // カード番号
      break;
    case 32:
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
      break;
  }
  console.log("send_data",buffer); 
  serialNumber++;
  ws.send(buffer);
}

// console.log("現在のターン数",roundnum);
// //カード情報の保存
// if (typeof(data) === "string") {
//   console.log("Error: バイナリーではないデータが送信されました");
// } else {
//   BinaryTranslation(data);
// }

// //現在ターン数の確認してターン開始
// if(byte[0]===30 && roundnum <= 5) {
//   roundnum = byte[2];
// }


// if(byte[0] === 32 && roundnum <= 5){
// //特殊効果発動順序
// if(SelectCard1.spd > SelectCard2.spd){
//   if(byte[5] === 0){
//     BattleFlow();
//   }
//   //確実に先制攻撃
//   if(byte[5] === 1){
//     if(SelectCard1.player === byte[3]){
//       SelectCard2.spd = 0;
//     }else{
//       SelectCard1.spd = 0;
//     }
//   }
//   //相手の攻撃無効化
//   if(byte[5] === 2){
//     if(SelectCard1.player === byte[3]){
//       SelectCard2.atk = 0;
//     }else{
//       SelectCard1.atk = 0;
//     }
//   }
// }

//   function  BattleFlow(){
//   //カードの速さを比較
//   if(SelectCard1.spd > SelectCard2.spd){
//     //先にプレイヤー１が攻撃
//     BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp); 
//     BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp); 
//     //後からプレイヤー２が攻撃
//     BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
//     BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
//   } else {
//     //先にプレイヤー２が攻撃
//     BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
//     BattleCalc(SelectCard1.player, SelectCard2.atk, SelectCard1.def, Player1.hp);
//     //後からプレイヤー１が攻撃
//     BattleCalc(SelectCard2.player, SelectCard1.atk, SelectCard2.def, Player2.hp);
//   }
// }
// }

//   // バトル中のダメージ計算
//   function BattleCalc(playernum, atknum, defnum, hpnum){
    
//     //負の値にならないようにして計算結果を定義
//     Damagevalue = Math.max(defnum - atknum, 0); 
//     //HPの更新
//     hpnum = Math.max(hpnum - Damagevalue, 0);//
//     //クラスインスタンスHPの変更
//     //クラスインスタンスHPの変更
//     if(playernum === 0){
//       Player1.hp = hpnum;
//       Player1.hp = hpnum;
//     }
//     else if (playernum === 1){
//       Player2.hp = hpnum;
//       Player2.hp = hpnum;
//     }
//     //ダメージの送信
//     response[0] = 32;
//     response[1] = serialNumber;
//     response[2] = playernum;//攻撃プレイヤーのID
//     response[3] = playernum+1 % 2;//被攻撃プレイヤーのID
//     response[4] = Damagevalue;//特殊効果番号
//     resopnse[5] = hpnum;//効果の引数1
//     resopnse[6] = hpnum;//被攻撃プレイヤーのhp
//     sendBinaryData(ws,response);
//   }

function CardSelect(data){
  //カード選択
  let pid = data[2];//プレイヤーID
  let cid = data[3];//カードID
  let selectedCard = cards[pid][cid];
  return selectedCard;
}