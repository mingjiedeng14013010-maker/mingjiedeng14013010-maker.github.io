// === 1. 模型链接 ===
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/"; 

let model, webcam;
let lastSpoken = ""; 
let isAppRunning = false; // 控制系统是否已启动

// === 2. 只有点击“启动按钮”后，才开始真正运行 ===
async function startApp() {
    // 1. 隐藏启动遮罩层
    document.getElementById("start-overlay").style.display = "none";
    document.getElementById("info-bar").innerText = "正在加载 AI 模型...";
    
    // 2. 🌟 核心技巧：解锁手机浏览器的语音权限
    // 必须在用户点击的瞬间，调用一次 speechSynthesis，后续才能随时播报
    let unlockSpeech = new SpeechSynthesisUtterance(""); 
    window.speechSynthesis.speak(unlockSpeech);

    isAppRunning = true;
    
    // 3. 开始加载模型
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    try {
        model = await tmImage.load(modelURL, metadataURL);
        document.getElementById("info-bar").innerText = "模型就绪，请对准路口";
        startPredicting(); // 启动预测
    } catch (e) {
        document.getElementById("info-bar").innerText = "网络连接失败，请刷新重试";
    }
}

// === 3. p5.js 初始化摄像头 ===
function setup() {
    // 创建一个铺满屏幕的画布
    createCanvas(windowWidth, windowHeight);
    
    // 🌟 核心配置：强制使用手机后置摄像头
    let constraints = {
        video: {
            facingMode: { ideal: "environment" }
        },
        audio: false
    };
    webcam = createCapture(constraints);
    webcam.hide(); // 隐藏原生视频元素
}

// === 4. p5.js 渲染循环 (全屏自适应画面) ===
function draw() {
    background(0);
    if (webcam && webcam.loadedmetadata) {
        // 计算画面比例，让视频完美铺满手机屏幕，不拉伸变形
        let videoRatio = webcam.width / webcam.height;
        let canvasRatio = width / height;
        let drawWidth, drawHeight, x, y;

        if (canvasRatio > videoRatio) {
            drawWidth = width;
            drawHeight = width / videoRatio;
            x = 0;
            y = (height - drawHeight) / 2;
        } else {
            drawHeight = height;
            drawWidth = height * videoRatio;
            y = 0;
            x = (width - drawWidth) / 2;
        }
        image(webcam, x, y, drawWidth, drawHeight);
    }
}

// === 5. 限制帧率的预测循环 (保护手机电池) ===
async function startPredicting() {
    if (!isAppRunning) return;
    
    if (model && webcam && webcam.loadedmetadata) {
        await predict();
    }
    // 每 200 毫秒计算一次 (每秒5次)，流畅且不发烫
    setTimeout(startPredicting, 200);
}

// === 6. AI 预测与变灯播报 ===
async function predict() {
    const prediction = await model.predict(webcam.elt);
    
    let highestPrediction = { className: "", probability: 0 };
    for (let i = 0; i < prediction.length; i++) {
        if (prediction[i].probability > highestPrediction.probability) {
            highestPrediction = prediction[i];
        }
    }

    let currentLabel = highestPrediction.className;
    let prob = highestPrediction.probability;
    let infoBar = document.getElementById("info-bar");

    if (prob > 0.85) {
        let currentStatus = "";
        
        if (currentLabel.includes("绿灯") || currentLabel.includes("綠燈")) {
            currentStatus = "绿灯亮了，请通行";
            infoBar.style.backgroundColor = "rgba(46, 204, 113, 0.9)"; // 界面变绿
        } else if (currentLabel.includes("红灯") || currentLabel.includes("紅燈")) {
            currentStatus = "红灯，请等待";
            infoBar.style.backgroundColor = "rgba(231, 76, 60, 0.9)"; // 界面变红
        }
        
        if (currentStatus !== "" && currentStatus !== lastSpoken) {
            lastSpoken = currentStatus;
            infoBar.innerText = currentStatus;
            speakWithWeb(currentStatus);
            
            setTimeout(() => { lastSpoken = ""; }, 6000);
        }
    } else {
        infoBar.innerText = "扫描路口中...";
        infoBar.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // 恢复半透明黑
        lastSpoken = "";
    }
}

// === 7. 手机端原生的语音播报 ===
function speakWithWeb(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN'; 
        utterance.rate = 1.1; // 语速稍微加快一点点，更干脆
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// 确保屏幕旋转时，画面也能跟着自适应
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}