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
let flag = 0; //0:マッチング処理、1:ゲーム中の処理
let roundnum = 20;      // 現在ラウンド数 わかりやすいように20になっていますが本当は0
let turnManege = 0;   // 1ターンのどこに該当するかを保持する
let cardnum = 0;      // カードの枚数
/*
0:ターン開始処理

↓プレイやーごとに行うので2回
1:カード選択処理 
2:カード選択処理　
3:バトル前特殊効果1
4:バトル前特殊効果2
5:バトル処理　早いほう
6:バトル処理　遅いほう
7:バトル後特殊効果1
8:バトル後特殊効果2
9:ターン終了処理 +特殊効果がある場合は清算

*/
//あとでインスタンス化
class Player {
  constructor(id) {
    this.id = id;
    this.hp = 10000;//とりあえず50
  }
}
let Players = [new Player(0), new Player(1)]; //プレイヤーのインスタンス初期値
class Card{
  constructor(id,player,atk,def,spd,effID){
    this.player = player;//どっちのプレイヤーのカードか このパラメータ使わないかも　cards配列で管理するから
    this.id = id;//カード番号
    this.atk = atk;//攻撃力
    this.def = def;//防御力
    this.spd = spd;//速さ
    this.eff = effID;//効果
  }
  effectActive(){
    //効果の発動
    switch(this.eff){
      case 10:
        //効果10
         //確実に先制攻撃
        if(turnManege === 3|| turnManege === 4){
          selectedCard[(this.player + 1) % 2][0].spd = 0;//相手の速さを0にする...0→idに変更
        }
        break;
      case 11:
        //効果11
        //相手の攻撃無効化
        if(turnManege === 3|| turnManege === 4){
          selectedCard[(this.player + 1) % 2][0].atk = 0;
        }
        break;
      case 12:
        //効果12
        //ターン終了時に自分の体力全回復
        if(turnManege === 7 || turnManege === 8){
          Players[this.player].hp = 10000;
        }
        break;
      case 13:
        if(turnManege === 7 || turnManege === 8){
          Players[this.player][0].hp = 200;
        }
        break;
      case 14:
        //効果14
        //相手の防御力が自分の防御力の3倍以上とかのときに相手の体力を残り5くらいまで減らす
        if(turnManege === 7 || turnManege === 8){
          if(selectedCard[(this.player + 1) % 2][0].def >= this.def * 3){
            Players[(this.player + 1) % 2][0].hp = 5;
          }
        }
        break;
      case 15:
        //効果15
         //相手の素早さを下げる
        if(turnManege === 3|| turnManege === 4){
          selectedCard[(this.player + 1) % 2][0].spd -= 20;
        }
        break;
      case 16:
        //効果16
        //両者の攻撃無効化
        if(turnManege === 3|| turnManege === 4){
          selectedCard[(this.player + 1) % 2][0].atk = 0;
          selectedCard[this.player][0].atk = 0;
        }
        break;
    }
  }
}

let clients = []; // クライアントを格納する配列

let cards  = Array.from({ length: 2 }, () => Array(5));//こっちの方がかんりしやすい
let  selectedCard = Array.from({ length: 2 }, () => Array(1));

let nextplayerID = 0;//最初にアクセスしたプレイヤーのID
wss.on('connection', function(ws) {//クライアントが接続してきたときの処理
    //クライアントが接続してきたときの処理
    console.log("client joined.");
    clients.push(ws);
    const PlayerID = nextplayerID;
    nextplayerID++; //次にアクセスするプレイヤーのID
    //const responsetest = new ArrayBuffer(2);//接続時のレスポンス
    // const view = new DataView(responsetest);
    // view.setUint8(0, 10); //通信種別:通信確立
    // view.setUint8(1, PlayerID); //クライアントにプレイヤーIDを送信
    sendBinaryData(ws, [10,PlayerID]);//プレイヤーが参加したことをクライアントに送信
    // 接続が2人になった場合、全クライアントに通知
    if (clients.length === 2) {
      console.log("2 players connected. Sending game start signal.");
      // const startSignal = new ArrayBuffer(1);
      // new DataView(startSignal).setUint8(0, 0x10); // 0x01 をゲーム開始シグナルとする
      // clients.forEach((client) => client.send(startSignal));
      sendBinaryData(ws, [16]);//ゲーム開始のシグナル
      flag = 1;
    }
  ws.on('message', function(data) {//クライアントからメッセージを受信したときの処理
    console.log(data);
    if(flag == 0){//画像の送受信用 マッチング処理もあった...

    }else{//以下に
      //テスト用
      const useData = BinaryTranslation(data);
      for(let i = 0; i < useData.length; i++){
        console.log("通信種別",useData[i]);
      }
      //通信種別による関数の呼び出し
      console.log("useData[0]: ",useData[0])
      switch(useData[0]){//種別に応じて関数を呼び出す
        case 36://選択カードの受信が36     選択カードの開示31サーバー→クライアント
          serialNumber++;
          let pid = useData[2];//プレイヤーID 0 or 1
          let cid = useData[3];//カードID 0~4
          selectedCard[pid][0] = CardSelect(useData);//クライアント１に選ばれたカードの取得
          let send_data = [31, serialNumber, pid, cid];//データの送信
          turnManege++;//ターンのどこなのかを管理
          sendBinaryData(ws,send_data);
          if(turnManege === 2){
            EffBeforeBattle(pid,ws);
          }
          break;
        case 24: //カード情報の受信・送信
        //カード情報をもう片方のクライアントに送信
        BinaryPassThrough(ws, data);
        console.log("PassThrough Done");
        //カードのインスタンス化
        cardnum++;
        cards[useData[1]][useData[2]] = new Card(useData[2],useData[1],useData[3],useData[4],useData[5],useData[6]);//種別,プレイヤー番号,カード番号,攻撃力,防御力,速さ,特殊効果
        if(cardnum === 10){
          //カードの選択フェーズに移行
          sendBinaryData(ws, [30,serialNumber,1]);//ターン開始
        }
        break;
        //カード情報の保存
      }
    }
  });
  ws.on('close', function() {
    console.log("client left.");
    // クライアントを配列から削除
    clients = clients.filter(client => client !== ws);
    if(clients.length === 0){
      // ゲーム中の場合は相手に通知
      nextplayerID = 0;
    }
  });
});

server.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`);
});

function BinaryTranslation(recv_data){//信号を元に戻す どう考えてもいるわこれ
  if(recv_data[0] ===24){
    let dataset = new Uint8Array(recv_data);
    let dataView = new DataView(dataset.buffer);
    dataset[3] = dataView.getUint16(3,false);//
    dataset[4] = dataView.getUint16(5,false);//
    return dataset;
  }else{
    let dataset = new Uint8Array(recv_data);
    //console.log("binary received from client -> " + Array.from(recv_data).join(", ") + "");
    //console.log("バイナリデータ",dataset);
    return dataset;  
  }


}

function sendBinaryData(ws,send_data){//信号をバイナリに変換して送信
  let buffer = new ArrayBuffer(9);
  let view = new DataView(buffer);
  //ここは共通の処理
  if(!(send_data[0] === 10||send_data[0] === 16)){//プレイヤーが参加したとき以外
    view.setUint8(0, send_data[0]); // 信号の種類
    view.setUint8(1, serialNumber++); // 命令の通し番号
  }

  //通信種別による処理
  switch (send_data[0]){// ターン数の送信
    case 10://サーバーに人が参加したら送信する
      view.setUint8(0, send_data[0]); // 信号の種類
      view.setUint8(1, send_data[1]); // プレイヤーID
      break;
    case 16://ゲーム開始のシグナル
      view.setUint8(0,send_data[0]); // ターン数
      break;
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
      view.setUint8(7, highByteHP); // HPの上位バイトを格納
      view.setUint8(8, lowByteHP); // HPの下位バイトを格納
      break;
  }
  console.log("send_data",buffer); 
  ws.send(buffer);
}

function CardSelect(data){
  //カード選択
  let pid = data[2];//プレイヤーID
  let cid = data[3];//カードID
  let selectedCard = cards[pid][cid];
  return selectedCard;
}

function BinaryPassThrough(sender, message) {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function  BattleFlow(ws){//turnManegeが5の時に呼び出す
  //カードの速さを比較
  if(selectedCard[0][0].spd > selectedCard[1][0].spd){
    //先にプレイヤー１が攻撃
    BattleCalc(selectedCard[1][0].player, selectedCard[0][0].atk, selectedCard[1][0].def, Players[1][0].hp,ws); 
    //後からプレイヤー２が攻撃
    BattleCalc(selectedCard[0][0].player, selectedCard[1][0].atk, selectedCard[0][0].def, Players[0][0].hp);
  } else {
    //先にプレイヤー２が攻撃
    BattleCalc(selectedCard[0][0].player, selectedCard[1][0].atk, selectedCard[0][0].def, Players[0][0].hp);
    //後からプレイヤー１が攻撃
    BattleCalc(selectedCard[1][0].player, selectedCard[0][0].atk, selectedCard[1][0].def, Players[1][0].hp);
  } 
}

// バトル中のダメージ計算
function BattleCalc(playernum, atknum, defnum, hpnum,ws){//被攻撃側のプレイヤー番号、攻撃力、防御力、HP
  //負の値にならないようにして計算結果を定義
  let Damagevalue = Math.max(defnum - atknum, 0); 
  //HPの更新
  hpnum = Math.max(hpnum - Damagevalue, 0);
  if(playernum === 0){
    Players[0][0].hp = hpnum; //クライアント１のHP更新
  }
  else if (playernum === 1){
    Players[1][0].hp = hpnum; //クライアント２のHP更新
  }
  turnManege++;
  sendBinaryData(ws,[32,serialNumber, Players[playernum][0].id, Players[(playernum +1) % 2 ][0].id, 0,0, Players[(playernum + 1) % 2][0].hp]);//32, シリアルナンバー, 攻撃プレイヤーID, 被攻撃プレイヤーID, 特殊効果, HP
  if(turnManege === 7){
    EffAfterBattle(playernum, ws);
  }
}

function EffBeforeBattle(pid,ws){//turnManegeが3の時に呼び出す
  //バトル前の特殊効果の処理
  selectedCard[pid][0].effectActive();
  sendBinaryData(ws,[32,serialNumber, Players[pid][0].id, Players[(pid +1) % 2 ][0].id, selectedCard[pid][0].eff,0, Players[(pid + 1) % 2][0].hp]);//32, シリアルナンバー, 攻撃プレイヤーID, 被攻撃プレイヤーID, 特殊効果, HP
  turnManege++;
  if(turnManege === 5){
    BattleFlow();
  }else{
    EffBeforeBattle((pid + 1) % 2);
  }
}

function EffAfterBattle(pid, ws){//turnManegeが7の時に呼び出す
  //バトル後の特殊効果の処理
  selectedCard[pid][0].effectActive();
  sendBinaryData(ws,[32,serialNumber, Players[pid][0].id, Players[(pid +1) % 2 ][0].id, selectedCard[pid][0].eff,0, Players[(pid + 1) % 2][0].hp]);//32, シリアルナンバー, 攻撃プレイヤーID, 被攻撃プレイヤーID, 特殊効果, 特殊効果引数,HP
  turnManege++;
  if(turnManege === 9){
    //ターン終了処理
    EndTurn(ws);
  }else{
    EffAfterBattle((pid + 1) % 2, ws);
  }
}

function EndTurn(ws){//turnManegeが9の時に呼び出す
  //ターン終了処理
  //特殊効果がある場合は清算
  send_data = [32,serialNumber, Players[0][0].id, Players[1][0].id, selectedCard[0][0].eff, 0,Players[1][0].hp];//32, シリアルナンバー, 攻撃プレイヤーID, 被攻撃プレイヤーID, 特殊効果, HP
  sendBinaryData(ws, send_data); //クライアント１が与えたダメージを送る
  send_data = [32,serialNumber, Players[1][0].id, Players[0][0].id, selectedCard[1][0].eff, 0,Players[0][0].hp];
  sendBinaryData(ws, send_data); //クライアント２が与えたダメージを送る
  turnManege = 0;
  roundnum++;
  sendBinaryData(ws, [30, serialNumber, roundnum]);//
}

// 1:カード選択処理 
// 2:カード選択処理　
// 3:バトル前特殊効果1
// 4:バトル前特殊効果2
// 5:バトル処理　早いほう
// 6:バトル処理　遅いほう
// 7:バトル後特殊効果1
// 8:バトル後特殊効果2
// 9:ターン終了処理 +特殊効果がある場合は清算
