```javascript
const recordings = {

    1: {
        recorder: null,
        stream: null,
        context: null,
        analyser: null,
        microphone: null,
        animation: null,
        startTime: null,
        timer: null,
        recording: false
    },

    2: {
        recorder: null,
        stream: null,
        context: null,
        analyser: null,
        microphone: null,
        animation: null,
        startTime: null,
        timer: null,
        recording: false
    }

};


/* =========================
   START / STOP
========================= */

async function toggleRecording(id) {

    const data = recordings[id];


    if (data.recording) {

        stopRecording(id);

    } else {

        await startRecording(id);

    }

}


/* =========================
   START
========================= */

async function startRecording(id) {

    const data = recordings[id];


    try {

        data.stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        data.context =
            new AudioContext();


        data.analyser =
            data.context.createAnalyser();


        data.analyser.fftSize = 256;


        data.microphone =
            data.context.createMediaStreamSource(
                data.stream
            );


        data.microphone.connect(
            data.analyser
        );


        data.recorder =
            new MediaRecorder(
                data.stream
            );


        data.recorder.start();


        data.recording = true;


        data.startTime =
            Date.now();


        changeButton(
            id,
            true
        );


        data.timer =
            setInterval(
                () => updateTimer(id),
                100
            );


        drawWave(id);


    } catch (error) {

        document.getElementById(
            `message${id}`
        ).textContent =
            "Please allow microphone access to continue.";

    }

}


/* =========================
   STOP
========================= */

function stopRecording(id) {

    const data = recordings[id];


    if (!data.recording) return;


    data.recording = false;


    data.recorder.stop();


    data.stream
        .getTracks()
        .forEach(
            track => track.stop()
        );


    clearInterval(
        data.timer
    );


    cancelAnimationFrame(
        data.animation
    );


    changeButton(
        id,
        false
    );


    const duration =
        (Date.now() - data.startTime) / 1000;


    /*
        FIRST RECORDING
        needs 30 seconds
    */

    if (id === 1) {

        if (duration < 30) {

            document.getElementById(
                "message1"
            ).textContent =
                "The audio should be at least 30 seconds long. Say something more.";

            return;

        }

    }


    /*
        SECOND RECORDING
        no minimum time
    */

    showResult(id);

}


/* =========================
   BUTTON
========================= */

function changeButton(id, recording) {

    const button =
        document.getElementById(
            `button${id}`
        );


    const text =
        document.getElementById(
            `buttonText${id}`
        );


    if (recording) {

        button.classList.add(
            "recording"
        );

        text.textContent =
            "Stop recording";

    } else {

        button.classList.remove(
            "recording"
        );

        text.textContent =
            "Start recording";

    }

}


/* =========================
   TIMER
========================= */

function updateTimer(id) {

    const data =
        recordings[id];


    const elapsed =
        Math.floor(
            (Date.now() - data.startTime)
            / 1000
        );


    const minutes =
        Math.floor(
            elapsed / 60
        );


    const seconds =
        elapsed % 60;


    document.getElementById(
        `timer${id}`
    ).textContent =

        String(minutes).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(seconds).padStart(
            2,
            "0"
        );

}


/* =========================
   WAVE
========================= */

function drawWave(id) {

    const data =
        recordings[id];


    if (!data.recording) return;


    const canvas =
        document.getElementById(
            `wave${id}`
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        canvas.clientWidth *
        window.devicePixelRatio;


    canvas.height =
        canvas.clientHeight *
        window.devicePixelRatio;


    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );


    const width =
        canvas.clientWidth;


    const height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const bufferLength =
        data.analyser.frequencyBinCount;


    const dataArray =
        new Uint8Array(
            bufferLength
        );


    data.analyser.getByteTimeDomainData(
        dataArray
    );


    ctx.beginPath();


    for (
        let x = 0;
        x < width;
        x++
    ) {

        const index =
            Math.floor(
                (x / width)
                * bufferLength
            );


        const value =
            dataArray[index] / 128;


        const y =
            height / 2
            +
            (value - 1)
            * 45;


        if (x === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );

        }

    }


    ctx.lineWidth = 3;

    ctx.strokeStyle =
        "rgba(255,255,255,0.9)";


    ctx.shadowBlur = 12;

    ctx.shadowColor =
        "rgba(255,255,255,0.5)";


    ctx.stroke();


    data.animation =
        requestAnimationFrame(
            () => drawWave(id)
        );

}


/* =========================
   SHOW PHOTO
========================= */

function showResult(id) {

    const result =
        document.getElementById(
            `result${id}`
        );


    const message =
        document.getElementById(
            `message${id}`
        );


    message.textContent = "";


    result.style.display =
        "block";


    setTimeout(() => {

        result.classList.add(
            "show"
        );

    }, 50);

}
```