export default class Packing{
    constructor(sketch, _width,_height,_itemCount,_minSize,_maxSize,_w){
        this.s = sketch;
        this.width = _width;
        this.height = _height;
        this.volume = this.width*this.height;
        this.minSize = _minSize;
        this.maxSize =  _maxSize;
        this.ominSize = this.minSize;
        this.omaxSize = this.maxSize;
        this.numTry = 900;
        this.numItems = _itemCount;
        this.count = 0;
        this.pos = new Array();
        this.weight = _w;
    }

    generate(){
        for(var i=0;i<this.numItems;i++){
            this.pack();
        }
    }

    pack()    {
        var start = this.count;
        for(var i=0;i<this.numTry;i++){
            if(
              this.count >= this.numItems || 
              this.maxSize < this.minSize
            ){
                break;
            }
            var xpos = this.s.random(0,this.width);
            var ypos = this.s.random(0,this.height);
            var r = this.maxSize/2.0;
            var v = Math.PI*(r*r)*0.8;
            if(!this.checkcollide(this.count-1,xpos,ypos,r))
            {
                var pt = this.s.createVector(xpos,ypos,this.maxSize);
                this.pos.push(pt);
                this.volume-=v;
                if(this.volume/v < 20.0)
                {
                    this.maxSize=this.maxSize*this.weight;
                }
                ++this.count;
            }

        }
        if(start == this.count)
            this.maxSize=this.maxSize*0.91;

    }

    
    iscollide(_x1,_y1,_x2,_y2,_r1,_r2)
    {
        var a = _r1+_r2;
        var dx = _x1-_x2;
        var dy = _y1-_y2;
        return a*a > (dx*dx+dy*dy);
    }

    checkcollide(_index,_x,_y,_r)
    {
        var collide = false;
        var maxDistance = 0;
        var tempDistance = 0;
        for(var i=0;i<this.pos.length;i++)
        {
            var vec = this.pos[i];
            var index = i;
            tempDistance = this.s.dist(vec.x,vec.y,_x,_y);
            if(tempDistance > maxDistance)
            {
                maxDistance = tempDistance;
            }
            if(this.iscollide(vec.x,vec.y,_x,_y,vec.z/2.0,_r))
            {
                collide = true;
                break;
            }
        }
  
         return collide;
    }

}