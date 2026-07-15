const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const music = document.getElementById("music");
const captureBtn = document.querySelector(".capture");

let blurAktif = false;
let sedangMemutar = false;

// ======================
// PLAY / STOP MUSIK
// ======================

captureBtn.addEventListener("click", async () => {

    if (sedangMemutar) {

        music.pause();
        music.currentTime = 0;

        sedangMemutar = false;
        captureBtn.textContent = "📷";

    } else {

        try {

            music.currentTime = 0;
            await music.play();

            sedangMemutar = true;
            captureBtn.textContent = "⏸";

        } catch (err) {

            console.error("Gagal memutar musik:", err);

        }

    }

});

// Jika lagu selesai
music.addEventListener("ended", () => {

    sedangMemutar = false;
    captureBtn.textContent = "📷";

});


// ======================
// BUKA KAMERA
// ======================

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({

            video: {
                width: 1280,
                height: 720
            },

            audio: false

        });

        video.srcObject = stream;

        video.onloadedmetadata = () => {

            video.play();

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            camera.start();

        };

    } catch (err) {

        console.error("Tidak dapat membuka kamera:", err);

    }

}

startCamera();


// ======================
// MEDIAPIPE
// ======================

const hands = new Hands({

    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`

});

hands.setOptions({

    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7

});


// ======================
// CEK GESTURE DUA JARI
// ======================

function cekDuaJari(hand) {

    const telunjuk = hand[8].y < hand[6].y;
    const tengah = hand[12].y < hand[10].y;

    const manis = hand[16].y > hand[14].y;
    const kelingking = hand[20].y > hand[18].y;

    return telunjuk && tengah && manis && kelingking;

}


// ======================
// HASIL DETEKSI
// ======================

hands.onResults((results) => {

    blurAktif = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {

        for (const landmarks of results.multiHandLandmarks) {

            if (cekDuaJari(landmarks)) {
                blurAktif = true;
            }

            // drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            //     color: "#ffffff",
            //     lineWidth: 3
            // });

            // drawLandmarks(ctx, landmarks, {
            //     color: "#D4AF37",
            //     radius: 4
           // });

        }

    }

    if (blurAktif) {

        video.style.filter = "blur(10px)";

    } else {

        video.style.filter = "blur(0px)";

    }

});


// ======================
// CAMERA UTILS
// ======================

const camera = new Camera(video, {

    onFrame: async () => {

        await hands.send({
            image: video
        });

    },

    width: 1280,
    height: 720

});