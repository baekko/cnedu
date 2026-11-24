// Register each sideline to the painted wall/floor seam in scenery-v163.webp.
// Measured source edge offsets at y400 and y650, in the 1065x1477 painting.
const units=(390/1065)/(500/1477),leftSlope=(38-6)/250*units,rightSlope=(35-6)/250*units;
export const GYM_COURT=Object.freeze({top:182,bottom:444,farLeft:2+262*leftSlope,farRight:388-262*rightSlope,nearLeft:2,nearRight:388});
export function gymCourtPoint(x,depth){
 const c=GYM_COURT,ratio=(c.farRight-c.farLeft)/(c.nearRight-c.nearLeft),denominator=1-(1-ratio)*depth,k=ratio*depth/denominator;
 const left=c.farLeft+(c.nearLeft-c.farLeft)*k,right=c.farRight+(c.nearRight-c.farRight)*k;
 return {x:left+(right-left)*(x+1)/2,y:c.top+(c.bottom-c.top)*k};
}
