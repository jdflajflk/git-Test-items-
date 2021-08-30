import controller_mouse from "./controller_mouse";
import hammer from "./hammer";
import gameManager from "./gameManager";

export default class mouse extends Laya.Script {
    enlarge:Laya.TimeLine;
    hammer_prefab:Laya.Prefab;/** @prop {name:hammer_prefab,tips:"锤子的预制体",type:Prefab} */

    position:number;

    constructor() { super(); }

    onAwake(): void{
        this.enlarge = Laya.TimeLine.to(this.owner,{scaleX:1.5,scaleY:1.5},500).
        to(this.owner,{scaleX:0,scaleY:0},500,null,1000);
    }

    onClick(): void{
        let mousex:number = Math.floor(Laya.MouseManager.instance.mouseX);
        let mousey:number = Math.floor(Laya.MouseManager.instance.mouseY);
        let hammer_new:Laya.Sprite = this.hammer_prefab.create();
        hammer_new.x = mousex;
        hammer_new.y = mousey;
        this.owner.parent.addChild(hammer_new);
        hammer_new.getComponent(hammer).onShow();
    }
    
    onShow(pos:number): void{
        (<Laya.Sprite>this.owner).scaleX = 0;
        (<Laya.Sprite>this.owner).scaleY = 0;
        this.position = pos;
        this.enlarge.play(0,false);
        this.enlarge.on("complete",this,function(){
            (<Laya.Sprite>this.owner).removeSelf();
            controller_mouse.mouse_Point[pos].using = false;
        });
        this.owner.on("click",this,this.onclick_Mouse,[pos]);
    }

    onclick_Mouse(pos:number): void{
        this.enlarge.pause();
        Laya.timer.once(400,this,this.onremove);
        controller_mouse.mouse_Point[pos].using = false;
    }

    onremove(): void{
        (<Laya.Sprite>this.owner).removeSelf();
        gameManager.instance.defen_normal += 100;
        (<Laya.Text>gameManager.instance.defen_value).text = gameManager.instance.defen_normal.toString();
    }

    onDestroy(): void{
        this.enlarge.pause();
        this.owner.clearTimer(this,this.onremove);
        controller_mouse.mouse_Point[this.position].using = false;
    }
}