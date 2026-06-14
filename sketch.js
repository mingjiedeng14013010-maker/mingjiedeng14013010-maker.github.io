// === 1. 配置部分 ===
let model, webcam;
let lastSpoken = ""; // 防止重复播报
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/"; // 确保这是你的模型链接

// === 2. 页面初始化 ===
function setup() {
    createCanvas(windowWidth, windowHeight);
    let constraints = { video: { facingMode: "environment" }, audio: false };
    webcam = createCapture(constraints);
    webcam.hide();
    noLoop(); // 只有点按钮启动后才开始
}

// === 3. 启动逻辑 (点击按钮调用此函数) ===
async function start() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('info').innerText = "加载中，请稍候...";
    
    // 加载模型
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    document.getElementById('info').innerText = "加载成功，开始识别";
    
    // 强制唤醒浏览器语音引擎
    window.speechSynthesis.resume();
    
    loop(); // 开始绘制和识别
    predict();
}

// === 4. 循环识别逻辑 ===
async function predict() {
    if (webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.8) {
            let res = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = res;
            
            // 语音逻辑
            if (res !== lastSpoken) {
                playSound(res);
                lastSpoken = res;
                // 5秒后允许再次播报
                setTimeout(() => { lastSpoken = ""; }, 5000);
            }
        }
    }
    setTimeout(predict, 1000); // 每秒识别一次，避免卡顿
}

// === 5. 语音核心函数 ===
// === 1. 初始化音频对象 ===
let redSound = new Audio('red.mp3');
let greenSound = new Audio('green.mp3');

// === 2. 替换原来的语音函数 ===
function playSound(type) {
    if (type === "红灯，请等待") {
        redSound.play();
    } else if (type === "绿灯，请通行") {
        greenSound.play();
    }
}

// === 6. 画面显示 ===
function draw() {
    background(0);
    if (webcam && webcam.loadedmetadata) {
        image(webcam, 0, 0, width, height);
    }
}
