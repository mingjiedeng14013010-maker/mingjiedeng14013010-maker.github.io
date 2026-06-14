let model, webcam;
let lastSpoken = ""; 
// ⚠️ 确保这个 URL 是你的 Teachable Machine 发布出来的链接，末尾必须有 /
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/"; 

function setup() {
    // 添加这段代码，强制解锁手机浏览器的音频权限
document.addEventListener('touchstart', function() {
    let context = new (window.AudioContext || window.webkitAudioContext)();
    context.resume(); // 强制恢复音频上下文
    window.speechSynthesis.resume(); // 强制恢复语音引擎
    console.log("音频已通过触摸解锁");
}, { once: true });
    createCanvas(windowWidth, windowHeight);
    noLoop(); // 启动前保持静止
}

// 点击启动按钮触发
async function startSystem() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('info').innerText = "加载中...";
    
    try {
        // 1. 初始化摄像头
        let constraints = { video: { facingMode: "environment" }, audio: false };
        webcam = createCapture(constraints);
        webcam.hide();

        // 2. 加载模型
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        
        // 3. 激活语音引擎
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }
        
        document.getElementById('info').innerText = "系统运行中";
        loop(); // 开始识别循环
        predict();
    } catch (e) {
        document.getElementById('info').innerText = "启动失败: " + e.message;
        console.error(e);
    }
}

async function predict() {
    if (webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        // 获取概率最高的分类
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.8) {
            let res = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = res;
            
            // 语音播报逻辑
            if (res !== lastSpoken) {
                speak(res);
                lastSpoken = res;
                // 5秒内禁止重复播报，防止复读
                setTimeout(() => { lastSpoken = ""; }, 5000);
            }
        }
    }
    // 每秒进行一次预测
    setTimeout(predict, 1000);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 停止当前正在说的，播报新的
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'zh-CN'; // 设置为中文
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
