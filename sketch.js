let model, webcam;
let lastSpoken = ""; 
// 确保这个URL是你 Teachable Machine 导出的模型链接
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/"; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); // 启动前不运行
}

async function start() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('info').innerText = "加载中...";
    
    try {
        // 1. 初始化摄像头
        let constraints = { video: { facingMode: "environment" }, audio: false };
        webcam = createCapture(constraints);
        webcam.hide();

        // 2. 加载模型
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        
        document.getElementById('info').innerText = "系统运行中";
        loop();
        predict();
    } catch (e) {
        document.getElementById('info').innerText = "启动失败: " + e.message;
        console.error(e);
    }
}

async function predict() {
    if (webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.8) {
            let res = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = res;
            
            // 语音逻辑：防止复读，如果状态变了才说话
            if (res !== lastSpoken) {
                speak(res);
                lastSpoken = res;
                // 5秒后重置，允许再次播报
                setTimeout(() => { lastSpoken = ""; }, 5000);
            }
        }
    }
    setTimeout(predict, 1000);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 取消之前的任务
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'zh-CN';
        msg.volume = 1;
        msg.rate = 1;
        window.speechSynthesis.speak(msg);
    }
}

function draw() {
    background(0);
    if (webcam && webcam.loadedmetadata) {
        image(webcam, 0, 0, width, height);
    }
}
