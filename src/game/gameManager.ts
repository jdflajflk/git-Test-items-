import controller_mouse from "./controller_mouse";
import mouse from "./mouse";

export default class gameManager extends Laya.Script {
   defen_value:Laya.Node;/** @prop {name:defen_value,tips:"游戏中的得分",type:Node} */
   time_value:Laya.Node;/** @prop {name:time_value,tips:"游戏剩余时间",type:Node} */
   game_over:Laya.Node;/** @prop {name:game_over,tips:"游戏结束界面",type:Node} */
   jiesuan_value:Laya.Node;/** @prop {name:jiesuan_value,tips:"游戏最终得分",type:Node} */
   heigh_value:Laya.Node;/** @prop {name:heigh_value,tips:"历史最高得分",type:Node} */
   mouse_prefab:Laya.Prefab;/** @prop {name:mouse_prefab,tips:"地鼠的预制体",type:Prefab} */
   controller_mouse_node:Laya.Node;/** @prop {name:controller_mouse_node,tips:"地鼠控制器",type:node} */

   countDown:number;/** @prop {name:countDown,tips:"游戏进行时间"，type:number} */
   countDown_value:number;/** @prop {name:countDown_value,tips:"游戏倒计时时长",type:number} */
   mouse_staTime:number = 2;/** @prop {name:mouse_staTime,tips:"地鼠开始随机时间",type:number,default:2} */
   mouse_endTime:number = 5;/** @prop {name:mouse_endTime,tips:"地鼠结束随机时间",type:number,default:5} */
   mouse_staNum:number = 2;/** @prop {name:mouse_staNum,tips:"地鼠开始随机数量",type:number,default:2} */
   mouse_endNum:number = 5;/** @prop {name:mouse_endNum,tips:"地鼠结束随机数量",type:number,default:5} */

   private isPlay:boolean;//是否正在进行游戏
   private defen_heigh:number = 0;//记录历史最高分
   private mouse_num:number = 0;//地鼠生成数量
   private playAgain_btn:Laya.Node;

   mouse_active_num:number = 0;//地鼠存在数量
   defen_normal:number = 0;//记录游戏得分
   static instance:gameManager;

    constructor() { super();}

    onAwake(): void{
        this.isPlay = false;
        gameManager.instance = this;

    }
    
    onStart(): void{
        this.playAgain_btn  = this.game_over.getChildByName("playAgain_btn");
        this.playAgain_btn.on("click",this,function(){
            (this.game_over as Laya.Sprite).visible = false;
            this.gameStart();
        });
    }

    
    
    gameStart(): void{
        this.isPlay = true;
        this.countDown = this.countDown_value;
        (this.time_value as Laya.Text).text = this.countDown.toString();
        (<Laya.Text>this.defen_value).text = this.defen_normal.toString();
        Laya.timer.loop(1000,this,this.count_Down,[],false);
        this.mouse_Create();
    }

    count_Down(): void{
        this.countDown--;
        (this.time_value as Laya.Text).text = this.countDown.toString();

        if(this.countDown <= 0)
        {
            this.gameOver();
        }
    }

    gameOver(): void{
        this.isPlay = false;

        Laya.timer.clear(this,this.count_Down);
        Laya.timer.clear(this,this.mouse_Create_Fun);

        if(this.defen_normal > this.defen_heigh){
            this.defen_heigh = this.defen_normal;
        }

        this.controller_mouse_node.destroyChildren();

        (this.jiesuan_value as Laya.Text).text = this.defen_normal.toString();
        (this.heigh_value as Laya.Text).text = this.defen_heigh.toString();
        (this.game_over as Laya.Sprite).visible = true;
        this.defen_normal = 0;
    }

    random_num(stanum:number,endnum:number): number{
        let x:number = Math.floor( Math.random()*(endnum + 1 - stanum) + stanum );
        return x;
    }

    random_mouse_num(): void{
        let x:number = this.random_num(this.mouse_staNum,this.mouse_endNum);
        this.mouse_num = x;
    }

    random_mouse_pos(): number{
        let x:number = this.random_num(0,8);
        return x;
    }

    mouse_Create(): void{
        Laya.timer.once(1000,this,this.mouse_Create_Fun,[],false);
        Laya.timer.loop(3000,this,this.mouse_Create_Fun,[],false);
    }

    mouse_Create_Fun(): void{
        this.random_mouse_num();
        let i:number;
        for(i = 0; i < this.mouse_num; i++) {
            this.mouse_active_num++;
            let mouse_prefab_new:any = this.mouse_prefab.create();
            let pos = this.random_mouse_pos();
            while(controller_mouse.mouse_Point[pos].using == true)
            {
                if(pos == 8)
                {
                    pos = 0;
                }
                pos++;
            }
            (<Laya.Sprite>mouse_prefab_new).x = controller_mouse.mouse_Point[pos].x;
            (<Laya.Sprite>mouse_prefab_new).y = controller_mouse.mouse_Point[pos].y;
            controller_mouse.mouse_Point[pos].using = true;
            this.controller_mouse_node.addChild(<Laya.Node>mouse_prefab_new);

            mouse_prefab_new.getComponent(mouse).onShow(pos);
        }
    }
}