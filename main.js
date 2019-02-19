
$('document').ready(function () {

    var socket = io.connect("http://localhost:8080");
    var nbrInputNotUsed = 0;
    var isRecording = false;


    // $('#btnUpdateModel').on('click', function () {
    //     socket.emit('updateModel');
    // });



    socket.on('nbrInputNotUsed', function (nbr) {
    });

    socket.on('prediction', function (data) {
        gender = data;
        showResult(gender);
    });

    socket.on('ready', function () {
        $('#btnPredict').removeClass("disabled");
        serverReady = true;
    });

    var mediaRecorder = null;
    var audio = null;
    var audioBlob = null;
    var serverReady = false;
    var gender;


    $('#btnRecord').on('click', function () {
        $('#btnRecord').toggleClass('btn-danger');
        $('#btnRecord').toggleClass('btn-primary');
        if (!isRecording) {
            isRecording = true;
            mediaRecorder.start();
            $('#btnRecord').text('Stop');
        }
        else {
            isRecording = false;
            mediaRecorder.stop();
            $('#btnRecord').text('Record');
        }
    });

    $('#btnPlay').on('click', function () {
        if (audio == null) {
            alert("Aucun enregistrement");
        }
        else {
            audio.play();
        }
    });

    $('#btnPredict').on('click', function () {
        if (serverReady) {
            socket.emit('predictGender');
        }
        else {
            alert('Server not ready');
        }
    });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(
            {
                audio: true
            })
            .then(function (stream) {

                mediaRecorder = new MediaRecorder(stream);
                var chunks = [];

                mediaRecorder.ondataavailable = function (e) {
                    chunks.push(e.data);
                }

                mediaRecorder.onstop = function (e) {
                    audioBlob = new Blob(chunks, { 'type': 'audio/wav; codecs=opus' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audio = new Audio(audioUrl);

                    chunks = [];
                    var duration = Math.round((audioBlob.size / 6653.27419312) * 10) / 10;

                    socket.emit('audioBlob', audioBlob);

                    $('#btnPredict').addClass("disabled");
                    $('#btnPlay').removeClass("disabled");
                    $('#btnPlay').text('Play (Recording ' + duration + 's)');
                }
            })
            .catch(function (err) {
                console.log('The following getUserMedia error occured: ' + err);
            });
    }

    showResult = function (gender) {
        $('#screen').toggleClass('collapse');
        $('#myPanel').show(800);
        if (gender == 'male')
            $('#textResult').text('Vous êtes : un homme');
        if (gender == 'female')
            $('#textResult').text('Vous êtes : une femme');
    }

    $('#btnYes').on('click', function () {
        $('#screen').toggleClass('collapse');
        $('#myPanel').hide(400);
        socket.emit('addNewInput', gender);
    });

    $('#btnNo').on('click', function () {
        $('#screen').toggleClass('collapse');
        $('#myPanel').hide(400);
        if (gender == 'male') socket.emit('addNewInput', 'female');
        else if (gender == 'female') socket.emit('addNewInput', 'male');
    });

    $('#close').on('click', function () {
        $('#screen').toggleClass('collapse');
        $('#myPanel').hide(400);
    });
});
