let model, webcam;
let lastSpoken = ""; 
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/"; // 确保这是你的模型链接

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); 
    
    // 关键：监听屏幕触摸，强制唤醒安卓浏览器的音频
    document.addEventListener('touchstart', () => {
        window.speechSynthesis.resume();
    }, { once: true });
}

async function startApp() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('info').innerText = "正在初始化...";
    
    // 1. 尝试唤醒语音引擎
    if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
    }

    try {
        // 2. 初始化摄像头
        let constraints = { video: { facingMode: "environment" }, audio: false };
        webcam = createCapture(constraints);
        webcam.hide();

        // 3. 加载模型
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        
        document.getElementById('info').innerText = "系统运行中，请对准灯光";
        loop();
        predict();
    } catch (e) {
        document.getElementById('info').innerText = "启动失败: " + e.message;
    }
}

async function predict() {
    if (webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.8) {
            let res = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = res;
            
            // 语音逻辑
            if (res !== lastSpoken) {
                speak(res);
                lastSpoken = res;
                setTimeout(() => { lastSpoken = ""; }, 5000);
            }
        }
    }
    setTimeout(predict, 1000);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 必须先取消，否则安卓机容易堆积卡死
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
