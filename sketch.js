let model, webcam, lastSpoken = "";
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/";

function setup() {
    createCanvas(windowWidth, windowHeight);
    // 强制调用后置摄像头
    let constraints = { video: { facingMode: "environment" }, audio: false };
    webcam = createCapture(constraints);
    webcam.hide();
}

// 用户点击启动后执行
async function start() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('info').innerText = "加载模型中...";
    
    try {
        // 修正：确保使用正确的库函数 tmImage.load
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        document.getElementById('info').innerText = "加载成功，开始识别";
        loop();
        predict();
    } catch (err) {
        document.getElementById('info').innerText = "错误: " + err.message;
        console.error(err);
    }
}

async function predict() {
    // 修正：使用 webcam.elt 获取视频元素
    if (model && webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.85) {
            let text = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = text;
            
            // 语音播报
            if (text !== lastSpoken) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
                lastSpoken = text;
                setTimeout(() => { lastSpoken = ""; }, 5000);
            }
        }
    }
    // 降低频率，防止手机发热卡顿
    setTimeout(predict, 1000); 
}

function draw() {
    background(0);
    if (webcam && webcam.loadedmetadata) {
        image(webcam, 0, 0, width, height);
    }
}
