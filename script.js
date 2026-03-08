const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");

let flowers = JSON.parse(localStorage.getItem("flowers")) || [];

let highlightEmail = null;

let mouseX = 0;
let mouseY = 0;



function saveFlowers(){

localStorage.setItem("flowers",JSON.stringify(flowers));

}



function drawFlower(f){

let pulse = Math.sin(Date.now()*0.003)*2;

let size = 20 * f.growth + pulse;

let dist = Math.hypot(mouseX-f.x,mouseY-f.y);

let glow = dist < 80;

for(let i=0;i<8;i++){

let angle = i * Math.PI/4;

let px = f.x + Math.cos(angle)*size;
let py = f.y + Math.sin(angle)*size;

ctx.beginPath();

ctx.arc(px,py,12*f.growth,0,Math.PI*2);

ctx.fillStyle = f.color;

ctx.fill();

}

ctx.beginPath();

ctx.arc(f.x,f.y,10*f.growth,0,Math.PI*2);

if(f.email===highlightEmail || glow){

ctx.shadowBlur=25;

ctx.shadowColor=f.color;

}else{

ctx.shadowBlur=0;

}

ctx.fillStyle="yellow";

ctx.fill();

}



function render(){

ctx.clearRect(0,0,canvas.width,canvas.height);

flowers.forEach(f=>{

if(f.growth<1){

f.growth+=0.02;

}

drawFlower(f);

});

requestAnimationFrame(render);

}

render();



function createFlower(){

let email=document.getElementById("email").value;

let story=document.getElementById("story").value;

let color=document.getElementById("color").value;

let flower={

email,

story,

color,

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

growth:0

};

flowers.push(flower);

saveFlowers();

}



function searchFlower(){

highlightEmail=document.getElementById("searchEmail").value;

}



canvas.addEventListener("mousemove",(e)=>{

const rect=canvas.getBoundingClientRect();

mouseX=e.clientX-rect.left;

mouseY=e.clientY-rect.top;

});



canvas.addEventListener("click",(e)=>{

const rect=canvas.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

flowers.forEach(f=>{

let dx=x-f.x;

let dy=y-f.y;

if(Math.sqrt(dx*dx+dy*dy)<20){

alert(f.story);

}

});

});



function closePopup(){

document.getElementById("popup").style.display="none";

}