export default class hammer extends Laya.Script {
    tap:Laya.TimeLine;
    
    constructor() { super(); }

    onAwake(): void{
        this.tap = Laya.TimeLine.to(this.owner,{rotation:30},200).to(this.owner,{rotation:-30},200);
    }
    
    onShow(): void{
        this.tap.play(0,false);
        this.tap.on("complete",this,function(){
            this.owner.removeSelf();
        });
    }

    onDestroy(): void{
        this.tap.pause();
    }
}