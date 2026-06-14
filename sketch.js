let model, webcam;
// ⚠️ 确保这个链接是你 Teachable Machine 导出的那个，结尾必须有 /
const URL = "https://teachablemachine.withgoogle.com/models/UZtdHT8jF/";

async function init() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('info').innerText = "1/3: 正在连接...";

    try {
        // 1. 初始化摄像头
        document.getElementById('info').innerText = "2/3: 正在打开摄像头...";
        const constraints = { video: { facingMode: "environment" }, audio: false };
        webcam = createCapture(constraints);
        webcam.hide();

        // 2. 加载模型
        document.getElementById('info').innerText = "3/3: 正在下载模型文件...";
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        
        document.getElementById('info').innerText = "加载完成！";
        loop();
        predict();
    } catch (err) {
        document.getElementById('info').innerText = "报错了: " + err.message;
        console.error(err);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop(); // 只有点启动后才开始循环
}

async function predict() {
    if (webcam && webcam.loadedmetadata) {
        const prediction = await model.predict(webcam.elt);
        let top = prediction.sort((a, b) => b.probability - a.probability)[0];
        
        if (top.probability > 0.8) {
            let res = top.className.includes("红") ? "红灯，请等待" : "绿灯，请通行";
            document.getElementById('info').innerText = res;
        }
    }
    setTimeout(predict, 1000);
}

function draw() {
    background(0);
    if (webcam && webcam.loadedmetadata) {
        image(webcam, 0, 0, width, height);
    }
}
