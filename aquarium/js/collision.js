// 화면에 그린 스프라이트의 불투명 픽셀을 사용합니다. 투명 사각 여백은 충돌하지 않습니다.
export function alphaMask(rgba, width, height, originX=width/2, originY=height/2) {
  const solid=new Uint8Array(width*height), points=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(rgba[(y*width+x)*4+3]>=80){solid[y*width+x]=1;points.push(x+.5-originX,y+.5-originY);}
  }
  return {width,height,originX,originY,solid,points};
}
export function masksTouch(a, ax, ay, angleA, b, bx, by, angleB) {
  const ca=Math.cos(angleA),sa=Math.sin(angleA),cb=Math.cos(angleB),sb=Math.sin(angleB);
  for(let i=0;i<a.points.length;i+=2){
    const x=a.points[i],y=a.points[i+1];
    const dx=ax+ca*x-sa*y-bx,dy=ay+sa*x+ca*y-by;
    const px=Math.floor(cb*dx+sb*dy+b.originX),py=Math.floor(-sb*dx+cb*dy+b.originY);
    // 1px 여유는 안티앨리어싱된 테두리가 맞닿는 순간도 포착합니다.
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
      const xx=px+ox,yy=py+oy;
      if(xx>=0&&xx<b.width&&yy>=0&&yy<b.height&&b.solid[yy*b.width+xx])return true;
    }
  }
  return false;
}
