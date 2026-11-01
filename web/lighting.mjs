const linear=Float32Array.from({length:256},(_,i)=>{const c=i/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
const srgb=Uint8Array.from({length:8193},(_,i)=>{const c=i/8192;return Math.round(255*(c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055));});
export const DEFAULTS={x:.3,y:.25,height:.6,power:1.4,ambient:.3,strength:.2,invert:false,color:'#ffffff',original:false};
export function validateDimensions(width,height){if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>8_000_000)throw Error('Use images with up to 8 million pixels.');}
export function matchingAspect(image,depth){return Math.abs((image.width/image.height)/(depth.width/depth.height)-1)<=.015;}
export function surface(rgba,depthRGBA,width,height){
 validateDimensions(width,height);const n=width*height;if(rgba.length!==n*4||depthRGBA.length!==n*4)throw Error('Image and depth pixels must match.');
 const depth=new Float32Array(n),temp=new Float32Array(n),gx=new Float32Array(n),gy=new Float32Array(n),scale=Math.max(width,height)/2;
 for(let i=0;i<n;i++){const j=i*4;if(depthRGBA[j+3]<250||Math.max(depthRGBA[j],depthRGBA[j+1],depthRGBA[j+2])-Math.min(depthRGBA[j],depthRGBA[j+1],depthRGBA[j+2])>3)throw Error('Choose an opaque grayscale depth map, rather than a coloured depth preview.');depth[i]=depthRGBA[j]/255;}
 // Gentle smoothing reduces quantization steps in 8-bit depth maps.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;temp[i]=(depth[y*width+Math.max(0,x-1)]+2*depth[i]+depth[y*width+Math.min(width-1,x+1)])/4;}
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;depth[i]=(temp[Math.max(0,y-1)*width+x]+2*temp[i]+temp[Math.min(height-1,y+1)*width+x])/4;}
 const sample=(i,center)=>rgba[i*4+3]?depth[i]:depth[center];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;gx[i]=(sample(y*width+Math.min(width-1,x+1),i)-sample(y*width+Math.max(0,x-1),i))*scale;gy[i]=(sample(Math.min(height-1,y+1)*width+x,i)-sample(Math.max(0,y-1)*width+x,i))*scale;}
 return{rgba,depth,gx,gy,width,height};
}
export function illuminate(s,params){
 const p={...DEFAULTS,...params},out=new Uint8ClampedArray(s.rgba.length);if(p.original){out.set(s.rgba);return out;}
 if(!/^#[a-f0-9]{6}$/i.test(p.color)||![p.x,p.y,p.height,p.power,p.ambient,p.strength].every(Number.isFinite)||p.height<.1||p.height>2||p.x<0||p.x>1||p.y<0||p.y>1||p.power<0||p.power>3||p.ambient<0||p.ambient>1||p.strength<0||p.strength>.8)throw Error('Invalid lighting settings.');
 const color=[1,3,5].map(at=>linear[parseInt(p.color.slice(at,at+2),16)]),max=Math.max(s.width,s.height),lx=(p.x-.5)*s.width/max,ly=(p.y-.5)*s.height/max,strength=p.strength*(p.invert?-1:1),encode=v=>srgb[Math.round(Math.min(1,Math.max(0,v))*8192)];
 for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++){
  const i=y*s.width+x,j=i*4,alpha=s.rgba[j+3];out[j+3]=alpha;if(!alpha)continue;
  const nx=-s.gx[i]*strength,ny=-s.gy[i]*strength,norm=1/Math.sqrt(nx*nx+ny*ny+1),dx=lx-(x+.5-s.width/2)/max,dy=ly-(y+.5-s.height/2)/max,dz=p.height-(s.depth[i]-.5)*strength,dist2=dx*dx+dy*dy+dz*dz;
  const diffuse=Math.max(0,(nx*dx+ny*dy+dz)*norm/Math.sqrt(Math.max(.0001,dist2))),light=p.power*diffuse/(1+2.5*dist2);
  out[j]=encode(linear[s.rgba[j]]*(p.ambient+light*color[0]));out[j+1]=encode(linear[s.rgba[j+1]]*(p.ambient+light*color[1]));out[j+2]=encode(linear[s.rgba[j+2]]*(p.ambient+light*color[2]));
 }
 return out;
}
