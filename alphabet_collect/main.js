let waterman = App.loadSpritesheet('res/waterman.png', 48, 64, {
    down: [1, 2, 3, 4],
    left: [6, 7, 8, 9],
    right: [11, 12, 13, 14],
    up: [16, 17, 18, 19],
    down_idle: [0],
    left_idle: [5],
    right_idle: [11],
    up_idle: [15],
}, 8);

let waterman_slow = App.loadSpritesheet('res/waterman_2.png', 48, 64, {
    down: [1, 2, 3, 4],
    left: [6, 7, 8, 9],
    right: [11, 12, 13, 14],
    up: [16, 17, 18, 19],
    down_idle: [0],
    left_idle: [5],
    right_idle: [11],
    up_idle: [15],
}, 8);

let mob = App.loadSpritesheet('res/mob.png', 64, 64, {left:[0], right: [1],},8)

let gamestate = 0;
let mobSpeedlv = 7;
let slowTime = 3;


App.onInit.Add(function () {
    gamestate = 0;
    putMob(21,16,"mob1");
    putMob(23,16,"mob2");
    putMob(2,12,"mob3");
    putMob(41,12,"mob4");
    putMob(21,8,"mob5");
    putMob(23,8,"mob6");
    putMob(2,4,"mob7");
    putMob(41,4,"mob8");
});


// 오브젝트 생성 함수
function putMob(x, y, keyname){
    Map.putObjectWithKey(x, y, mob, {
        overlap: true,
        movespeed: mobSpeedlv*10,
        key: keyname,
        useDirAnim: true,
    });
}

// 오브젝트 이동 함수
function mobMove(keyname, x, y){
    Map.moveObjectWithKey(keyname, x, y, true);
}

// 첫번째 루프. 앱 종료 여부 따지고 일정 시간 후 두번째 루프 실행 
function mobLoop1(x,y,obx,oby,keyname){
    if(gamestate==1){
        return;
    }
    mobMove(keyname, obx, oby);
    setTimeout(() => {
        mobLoop2(obx,oby,x,y,keyname);
    }, (obx-x)>0 ? (obx-x)*190 : (x-obx)*190);
}

// 두번째 루프
function mobLoop2(x,y,obx,oby,keyname){
    if(gamestate==1){
        return;
    }
    mobMove(keyname, obx, oby);
    setTimeout(() => {
        mobLoop1(obx,oby,x,y,keyname);
    }, (obx-x)>0 ? (obx-x)*190 : (x-obx)*190);
}

// 앱 종료 시
App.onDestroy.Add(function () {
    gamestate=1;
});

App.onStart.Add(function () {
    if(App.storage == null){    // 최초 앱 실행 시 스토리지 생성
		App.setStorage(JSON.stringify({pID : []}));
	}
    // 몬스터 오브젝트 생성
    mobLoop1(21, 16, 2, 16, "mob1");
    mobLoop1(23, 16, 41, 16, "mob2");
    mobLoop1(2, 12, 19, 12, "mob3");
    mobLoop1(41, 12, 23, 12, "mob4");
    mobLoop1(21, 8, 2, 8, "mob5");
    mobLoop1(23, 8, 41, 8, "mob6");
    mobLoop1(2, 4, 20, 4, "mob7");
    mobLoop1(41, 4, 24, 4, "mob8");
});

// 플레이어 입장 시
App.onJoinPlayer.Add(function (player) {
    player.tag = {
        check : 0,
        change : 0,
        isPlaying : 0,
        widgetSW: null,
        widgetItem: null,
    };
    player.sendUpdated();

    App.getStorage(function () {
        let playerId = JSON.parse(App.storage); // 변수에 스토리지 파싱
        // 스토리지에 지금 접속한 플레이어 id가 있나 확인
        if(playerId.pID.includes(player.id)){
            player.tag.check = 1;   // id 중복 접속자 구분. 1이면 중복 접속
        } else {
            playerId.pID.push(player.id);   // 파싱받은 변수에 신규 접속자 id 추가
        }
        App.setStorage(JSON.stringify(playerId)); // 내용 추가한 변수 스토리지에 적용
    });

});

// 신규 접속자 대상으로 처음 1회만 팝업
App.addOnLocationTouched("popup", function(player){
    if(player.tag.check==0){
        player.tag.check=1;
        player.showImageModal("https://2894115210-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FiW553XSGeKCAPpImxXi3%2Fuploads%2Ff23h7qlPgo6KxGZomId3%2Fimage.png?alt=media&token=0e9c7f0f-94a7-4c97-8c9c-309062306650");
    };
});

// 다시 입구로 돌아올 때 스톱워치 위젯 삭제
App.addOnLocationTouched("reset_sw", function(player){
    if(player.tag.isPlaying==1){
        player.tag.isPlaying=0
        player.tag.widgetSW.destroy();
        player.tag.widgetSW = null;
        player.tag.widgetItem.destroy();
        player.tag.widgetItem = null;
    }
});

// 입구 진입 시 
App.addOnLocationTouched("game_start", function(player){
    if(player.tag.change==0){
        player.showCenterLabel("우측 오브젝트를 이용해 아바타를 교체해 주세요!");
        player.spawnAt(4, 20, 2);
        return;
    }
    if(player.tag.widgetSW==null){
        player.tag.isPlaying=1;
        player.tag.widgetItem = player.showWidget("res/widgetItem.html", "topleft", 430, 130);
        player.tag.widgetSW = player.showWidget("res/widgetSW.html", "top", 220, 100);
        player.tag.widgetSW.sendMessage({state: "start",});
    }
    player.tag.alphabet = [];
    player.title = "";
    player.sendUpdated();
});

// 출구 진입 시
App.addOnLocationTouched("game_end", function(player){
    if(player.tag.isPlaying==1 && player.tag.alphabet.length==6){
        player.tag.widgetSW.sendMessage({state: "stop",});
        player.tag.isPlaying=0;
    } else if (player.tag.isPlaying==1 && player.tag.alphabet.length!=6){
        player.showCenterLabel("알파벳을 다 모아야 합니다!!");
        player.spawnAt(40, 18, 4);
    } else if (player.tag.isPlaying==0){
        player.showCenterLabel("재도전버튼을 이용해 주세요");
        player.spawnAt(40, 20, 2);
    }
    if(player.tag.widgetA!=null){
        player.tag.widgetA.destroy();
        player.tag.widgetA = null;
    }
    if(player.tag.widgetB!=null){
        player.tag.widgetB.destroy();
        player.tag.widgetB = null;
    }
});

// key 값을 가지는 오브젝트와 충돌 시
App.onAppObjectTouched.Add(function (player, key, x, y) {
    if(key.includes("mob")){
        player.moveSpeed = 50
        player.sprite = waterman_slow;
        player.sendUpdated();
        setTimeout(() => {
            player.sprite = waterman; 
            player.moveSpeed = 90
            player.sendUpdated();
        }, slowTime*1000);
    }
});

// 아이템 표시 위젯 함수
function toWidget (player, item){
    if(!(player.tag.alphabet.includes(item))){
        player.tag.alphabet.push(item);
        let strTitle = player.tag.alphabet.sort().join("");
        player.title = strTitle;
        player.sendUpdated();
        player.tag.widgetItem.sendMessage({
            text: item,
        });
    }
}

// 맵 에디터로 설치한 오브젝트와 F 상호작용 시
App.onTriggerObject.Add(function (player, layerID, x, y) {
    if(x==12 && y==20){ // 캐릭터 바꾸기 오브젝트
        player.sprite = waterman;
        player.tag.change = 1;
        player.sendUpdated();
        player.showCenterLabel(`캐릭터 교체!`);
    }

    if(x==34 && y==27){ // 재도전 오브젝트 상호작용 시
        player.tag.alphabet = [];
        player.title = "";
        player.spawnAt(4, 27, 2);
        player.tag.widgetItem.destroy();
        player.tag.widgetItem = null;
        player.tag.widgetSW.destroy();
        player.tag.widgetSW = null;
        player.sendUpdated();
    }

    if(x==19 && y==12){ // A와 상호작용 시
        toWidget(player, "A");
    }
    if(x==2 && y==8){ // B와 상호작용 시
        toWidget(player, "B");
    }
    if(x==20 && y==4){ // C와 상호작용 시
        toWidget(player, "C");
    }
    if(x==41 && y==4){ // D와 상호작용 시
        toWidget(player, "D");
    }
    if(x==41 && y==8){ // E와 상호작용 시
        toWidget(player, "E");
    }
    if(x==23 && y==12){ // F와 상호작용 시
        toWidget(player, "F");
    }
});

// 스토리지 접속자 누적 데이터 삭제
command = "!remove"
App.onSay.Add(function (player, text) {
    if(command == text){
        App.getStorage(function () {
            let rmStorage = JSON.parse(App.storage);
            rmStorage.pID = [];
            App.setStorage(JSON.stringify(rmStorage));
        })
        player.sendMessage('삭제 완료', 0xeb4034);
    }
});
