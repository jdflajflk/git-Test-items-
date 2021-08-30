(function () {
    'use strict';

    let controller_mouse = {
        mouse_Point: [
            { x: 256, y: 370, using: false }, { x: 500, y: 370, using: false }, { x: 770, y: 370, using: false },
            { x: 220, y: 490, using: false }, { x: 500, y: 490, using: false }, { x: 770, y: 490, using: false },
            { x: 210, y: 620, using: false }, { x: 500, y: 620, using: false }, { x: 790, y: 620, using: false }
        ]
    };

    class hammer extends Laya.Script {
        constructor() { super(); }
        onAwake() {
            this.tap = Laya.TimeLine.to(this.owner, { rotation: 30 }, 200).to(this.owner, { rotation: -30 }, 200);
        }
        onShow() {
            this.tap.play(0, false);
            this.tap.on("complete", this, function () {
                this.owner.removeSelf();
            });
        }
        onDestroy() {
            this.tap.pause();
        }
    }

    class mouse extends Laya.Script {
        constructor() { super(); }
        onAwake() {
            this.enlarge = Laya.TimeLine.to(this.owner, { scaleX: 1.5, scaleY: 1.5 }, 500).
                to(this.owner, { scaleX: 0, scaleY: 0 }, 500, null, 1000);
        }
        onClick() {
            let mousex = Math.floor(Laya.MouseManager.instance.mouseX);
            let mousey = Math.floor(Laya.MouseManager.instance.mouseY);
            let hammer_new = this.hammer_prefab.create();
            hammer_new.x = mousex;
            hammer_new.y = mousey;
            this.owner.parent.addChild(hammer_new);
            hammer_new.getComponent(hammer).onShow();
        }
        onShow(pos) {
            this.owner.scaleX = 0;
            this.owner.scaleY = 0;
            this.position = pos;
            this.enlarge.play(0, false);
            this.enlarge.on("complete", this, function () {
                this.owner.removeSelf();
                controller_mouse.mouse_Point[pos].using = false;
            });
            this.owner.on("click", this, this.onclick_Mouse, [pos]);
        }
        onclick_Mouse(pos) {
            this.enlarge.pause();
            Laya.timer.once(400, this, this.onremove);
            controller_mouse.mouse_Point[pos].using = false;
        }
        onremove() {
            this.owner.removeSelf();
            gameManager.instance.defen_normal += 100;
            gameManager.instance.defen_value.text = gameManager.instance.defen_normal.toString();
        }
        onDestroy() {
            this.enlarge.pause();
            this.owner.clearTimer(this, this.onremove);
            controller_mouse.mouse_Point[this.position].using = false;
        }
    }

    class gameManager extends Laya.Script {
        constructor() {
            super();
            this.mouse_staTime = 2;
            this.mouse_endTime = 5;
            this.mouse_staNum = 2;
            this.mouse_endNum = 5;
            this.defen_heigh = 0;
            this.mouse_num = 0;
            this.mouse_active_num = 0;
            this.defen_normal = 0;
        }
        onAwake() {
            this.isPlay = false;
            gameManager.instance = this;
        }
        onStart() {
            this.playAgain_btn = this.game_over.getChildByName("playAgain_btn");
            this.playAgain_btn.on("click", this, function () {
                this.game_over.visible = false;
                this.gameStart();
            });
        }
        gameStart() {
            this.isPlay = true;
            this.countDown = this.countDown_value;
            this.time_value.text = this.countDown.toString();
            this.defen_value.text = this.defen_normal.toString();
            Laya.timer.loop(1000, this, this.count_Down, [], false);
            this.mouse_Create();
        }
        count_Down() {
            this.countDown--;
            this.time_value.text = this.countDown.toString();
            if (this.countDown <= 0) {
                this.gameOver();
            }
        }
        gameOver() {
            this.isPlay = false;
            Laya.timer.clear(this, this.count_Down);
            Laya.timer.clear(this, this.mouse_Create_Fun);
            if (this.defen_normal > this.defen_heigh) {
                this.defen_heigh = this.defen_normal;
            }
            this.controller_mouse_node.destroyChildren();
            this.jiesuan_value.text = this.defen_normal.toString();
            this.heigh_value.text = this.defen_heigh.toString();
            this.game_over.visible = true;
            this.defen_normal = 0;
        }
        random_num(stanum, endnum) {
            let x = Math.floor(Math.random() * (endnum + 1 - stanum) + stanum);
            return x;
        }
        random_mouse_num() {
            let x = this.random_num(this.mouse_staNum, this.mouse_endNum);
            this.mouse_num = x;
        }
        random_mouse_pos() {
            let x = this.random_num(0, 8);
            return x;
        }
        mouse_Create() {
            Laya.timer.once(1000, this, this.mouse_Create_Fun, [], false);
            Laya.timer.loop(3000, this, this.mouse_Create_Fun, [], false);
        }
        mouse_Create_Fun() {
            this.random_mouse_num();
            let i;
            for (i = 0; i < this.mouse_num; i++) {
                this.mouse_active_num++;
                let mouse_prefab_new = this.mouse_prefab.create();
                let pos = this.random_mouse_pos();
                while (controller_mouse.mouse_Point[pos].using == true) {
                    if (pos == 8) {
                        pos = 0;
                    }
                    pos++;
                }
                mouse_prefab_new.x = controller_mouse.mouse_Point[pos].x;
                mouse_prefab_new.y = controller_mouse.mouse_Point[pos].y;
                controller_mouse.mouse_Point[pos].using = true;
                this.controller_mouse_node.addChild(mouse_prefab_new);
                mouse_prefab_new.getComponent(mouse).onShow(pos);
            }
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("game/gameManager.ts", gameManager);
            reg("game/hammer.ts", hammer);
            reg("game/mouse.ts", mouse);
        }
    }
    GameConfig.width = 960;
    GameConfig.height = 640;
    GameConfig.scaleMode = "fixedauto";
    GameConfig.screenMode = "horizontal";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "ceshi.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
