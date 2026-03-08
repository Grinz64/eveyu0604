import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase config (換成你的)

const firebaseConfig = {
apiKey: "YOURKEY",
authDomain: "YOURDOMAIN",
projectId: "YOURPROJECTID"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");

let flowers = [];

let highlightEmail = null;



function drawFlower(f){

for(let i=0;i<8;i++){

let angle = i * Math.PI/4;

let px = f.x + Math.cos(angle)*25;
let py = f.y + Math.sin(angle)*25;

ctx.beginPath();

ctx.arc(px,py,12,0,Math.PI*2);

ctx.fillStyle = f.color;

ctx.fill();

}


ctx.beginPath();

ctx.arc(f.x,f.y,10,0,Math.PI*2);

if(f.email === highlightEmail){

ctx.shadowBlur = 30;

ctx.shadowColor = f.color;

}else{

ctx.shadowBlur = 0;

}

ctx.fillStyle = "yellow";

ctx.fill();

}



function render(){

ctx.clearRect(0,0,canvas.width,canvas.height);

flowers.forEach(drawFlower);

requestAnimationFrame(render);

}

render();




async function loadFlowers(){

const snapshot = await getDocs(collection(db,"flowers"));

snapshot.forEach(doc=>{

flowers.push(doc.data());

});

}

loadFlowers();




document.getElementById("createFlower").onclick = async ()=>{

const email = document.getElementById("email").value;

const story = document.getElementById("story").value;

const color = document.getElementById("color").value;

const x = Math.random()*canvas.width;

const y = Math.random()*canvas.height;


const flower = {

email,

story,

color,

x,

y

};


await addDoc(collection(db,"flowers"),flower);

flowers.push(flower);

};




document.getElementById("searchFlower").onclick = ()=>{

highlightEmail = document.getElementById("searchEmail").value;

};




canvas.addEventListener("click",(e)=>{

const rect = canvas.getBoundingClientRect();

const x = e.clientX - rect.left;

const y = e.clientY - rect.top;


flowers.forEach(f=>{

const dx = x - f.x;

const dy = y - f.y;


if(Math.sqrt(dx*dx+dy*dy)<20){

alert(f.story);

}

});

});



window.closePopup = ()=>{

document.getElementById("popup").style.display="none";

}