import React, { useState, useRef } from 'react';
import { Copy, Check, Info } from 'lucide-react';

const rgbToLab = (R, G, B) => {
  let r = R / 255;
  let g = G / 255;
  let b = B / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  const fx = x > 0.008856 ? Math.pow(x,1/3) : (7.787*x)+(16/116);
  const fy = y > 0.008856 ? Math.pow(y,1/3) : (7.787*y)+(16/116);
  const fz = z > 0.008856 ? Math.pow(z,1/3) : (7.787*z)+(16/116);

  return {
    l:(116*fy)-16,
    a:500*(fx-fy),
    b:200*(fy-fz)
  };
};


const ColorDetailsPanel = ({analysisData,onColorChange}) => {

  const [copied,setCopied] = useState(false);
  const imgRef = useRef(null);


  if(!analysisData){
    return(
      <div className="border border-dashed border-slate-800 bg-slate-950/20 rounded-xl p-5 flex items-center justify-center h-full">
        <p className="text-slate-500 text-xs">
          Crop image to load color details
        </p>
      </div>
    )
  }


  const {roi_image,color_features}=analysisData;


  const hex=color_features?.hex ?? "#000000";

  const R=color_features?.R ?? 0;
  const G=color_features?.G ?? 0;
  const B=color_features?.B ?? 0;

  const L=color_features?.CIE_L_star ?? 0;
  const A=color_features?.CIE_a_star ?? 0;
  const B_lab=color_features?.CIE_b_star ?? 0;


  const copyHex=()=>{
    navigator.clipboard.writeText(hex);
    setCopied(true);

    setTimeout(()=>{
      setCopied(false)
    },2000)
  }



  const handleImageClick=(e)=>{

    const img=imgRef.current;
    if(!img)return;


    const canvas=document.createElement("canvas");

    canvas.width=img.naturalWidth;
    canvas.height=img.naturalHeight;


    const ctx=canvas.getContext("2d");

    ctx.drawImage(img,0,0);


    const rect=img.getBoundingClientRect();


    const x=Math.floor(
      (e.clientX-rect.left)
      *
      img.naturalWidth/rect.width
    );


    const y=Math.floor(
      (e.clientY-rect.top)
      *
      img.naturalHeight/rect.height
    );


    const pixel=ctx.getImageData(x,y,1,1).data;


    const r=pixel[0];
    const g=pixel[1];
    const b=pixel[2];


    const toHex=(v)=>
      v.toString(16).padStart(2,"0").toUpperCase();


    const newHex=
      `#${toHex(r)}${toHex(g)}${toHex(b)}`;


    const lab=rgbToLab(r,g,b);



    onColorChange?.({

      hex:newHex,

      R:r,
      G:g,
      B:b,

      CIE_L_star:lab.l,
      CIE_a_star:lab.a,
      CIE_b_star:lab.b

    });

  }



return(

<div className="border border-slate-800 bg-slate-950/40 rounded-xl p-5 glow-border">

{/* HEADER */}

<div className="flex items-center gap-2 mb-4">

<span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
3
</span>

<span className="font-bold text-sm text-blue-500">
Color & Details
</span>

</div>



{/* IMAGE */}

<p className="text-xs text-slate-400 mb-2">
Cropped Image
</p>


<div className="aspect-[2.2/1] rounded-lg overflow-hidden border border-slate-800">

<img

ref={imgRef}

src={roi_image}

className="w-full h-full object-cover cursor-crosshair"

onClick={handleImageClick}

/>

</div>




{/* HEX */}

<p className="text-xs text-slate-400 mt-4 mb-2">
Selected Color
</p>



<div className="flex items-center gap-3">


<div

className="w-10 h-10 rounded-lg border border-slate-700"

style={{backgroundColor:hex}}

/>



<div className="
flex-1
flex
items-center
justify-between
rounded-lg
px-3
py-2
bg-slate-900
border
border-blue-500/40
">


<span className="
text-blue-400
font-mono
font-bold
text-sm
tracking-widest
">

{hex.toUpperCase()}

</span>



<button

onClick={copyHex}

className="text-blue-400 hover:text-blue-200"

>

{
copied
?
<Check size={15}/>
:
<Copy size={15}/>
}

</button>


</div>

</div>





{/* RGB LAB */}

<div className="grid grid-cols-2 gap-3 mt-4">


<div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

<p className="text-xs text-slate-500 mb-2">
RGB
</p>


<p className="text-blue-400 font-mono">
R: {Math.round(R)}
</p>

<p className="text-blue-400 font-mono">
G: {Math.round(G)}
</p>

<p className="text-blue-400 font-mono">
B: {Math.round(B)}
</p>


</div>




<div className="bg-slate-950 border border-slate-800 rounded-lg p-3">

<p className="text-xs text-slate-500 mb-2">
CIE L*a*b*
</p>


<p className="text-blue-400 font-mono">
L*: {L.toFixed(2)}
</p>

<p className="text-blue-400 font-mono">
a*: {A.toFixed(2)}
</p>

<p className="text-blue-400 font-mono">
b*: {B_lab.toFixed(2)}
</p>


</div>


</div>




<div className="
mt-4
flex
gap-2
p-3
rounded-lg
bg-blue-950/20
border
border-blue-500/20
">

<Info size={14} className="text-blue-400"/>

<p className="text-xs text-slate-400">

Click image to select another pixel color.
Values update automatically.

</p>


</div>


</div>

)


}


export default ColorDetailsPanel;