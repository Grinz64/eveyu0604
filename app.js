import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 1. Firebase 配置 (請確認填寫正確) */
const firebaseConfig = {
    apiKey: "你的APIKEY",
    authDomain: "你的project.firebaseapp.com",
    projectId: "你的project",
    storageBucket: "你的project.appspot.com",
    messagingSenderId: "xxxx",
    appId: "xxxx"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* 2. Canvas 初始化與手機版適應 */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let flowers = [];
let highlightEmail = null;


/* 3. 繪圖邏輯：包含花莖與發光 */
function drawFlower(f) {
    let pulse = Math.sin(Date.now() * 0.004) * 0.05;
    let size = f.growth + pulse;

    // 繪製花莖 (在花朵下方)
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.quadraticCurveTo(f.x + 10 * f.growth, f.y + (canvas.height - f.y) / 2, f.x, canvas.height);
    ctx.strokeStyle = "#4d7c0f";
    ctx.lineWidth = 2 * f.growth;
    ctx.stroke();

    // 搜尋高亮：淺黃色的光
    if (highlightEmail && f.email === highlightEmail) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = "rgba(255, 255, 150, 0.8)"; 
    } else {
        ctx.shadowBlur = 0;
    }

    // 花瓣
    for (let i = 0; i < 8; i++) {
        let angle = (i * Math.PI) / 4;
        let px = f.x + Math.cos(angle) * (20 * size);
        let py = f.y + Math.sin(angle) * (20 * size);
        ctx.beginPath();
        ctx.arc(px, py, 12 * size, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
    }

    // 花心
    ctx.beginPath();
    ctx.arc(f.x, f.y, 10 * size, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.shadowBlur = 0; // 重置陰影
}

/* 4. 渲染迴圈 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 搜尋時變暗背景
    if (highlightEmail) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    flowers.forEach((f) => {
        if (f.growth < 1) f.growth += 0.01; // 控制生長速度
        drawFlower(f);
    });
    requestAnimationFrame(render);
}
render();

/* 5. 創建花朵 (對應你的 Start 按鈕) */
// 注意：請確保 HTML 裡的按鈕 ID 是 "submitBtn" 或改為你定義的名稱


const submitBtn = document.getElementById("submitBtn");


if (submitBtn) {
    submitBtn.onclick = async () => {
        const emailInput = document.getElementById("email");
        const storyInput = document.getElementById("story");
        const colorInput = document.getElementById("color");

        const email = emailInput.value;
        const story = storyInput.value;
        const color = colorInput.value;

        if (!email || !story) return alert("請填寫 Email 與故事");

        // 隨機座標 (手機版會根據螢幕寬度自動調整)
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.1);

        const flower = {
            email,
            story,
            color,
            x,
            y,
            growth: 0, // 從 0 開始生長
            createdAt: new Date() // 記錄時間，方便後台排序
        };

        try {
            // 存入 Firebase
            await addDoc(collection(db, "flowers"), flower);
            flowers.push(flower);

            // 清空欄位
            emailInput.value = "";
            storyInput.value = "";
            colorInput.value = "#ff69b4";
            console.log("資料已成功上傳後台");
        } catch (e) {
            console.error("上傳失敗: ", e);
            alert("上傳失敗，請檢查網路或 Firebase 設定");
        }
    };
}

/* 6. 載入花朵 (修復重新整理不見的問題) */
async function loadFlowers() {
    try {
        const q = query(collection(db, "flowers"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);
        flowers = []; // 清空目前的陣列避免重複
        querySnapshot.forEach((doc) => {
            let f = doc.data();
            f.growth = 1; // 載入舊的花直接設為成熟
            flowers.push(f);
        });
        console.log("已從後台載入 " + flowers.length + " 朵花");
    } catch (e) {
        console.error("載入失敗: ", e);
    }
}
loadFlowers();

/* 7. 搜尋與點擊 */
document.getElementById("searchBtn").onclick = () => {
    highlightEmail = document.getElementById("searchEmail").value;
};

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    flowers.forEach(f => {
        const dx = x - f.x;
        const dy = y - f.y;
        if (Math.sqrt(dx*dx + dy*dy) < 30) alert(f.story);
    });
});