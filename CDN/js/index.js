var signatureKey = null;

window.addEventListener("DOMContentLoaded", function (event) {
    console.log("DOM fully loaded and parsed");
    websdkready();
});

function websdkready() {
    var testTool = window.testTool;
    if (testTool.isMobileDevice()) {
        vConsole = new VConsole();
    }
    console.log("checkSystemRequirements");
    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    ZoomMtg.preLoadWasm(); // pre download wasm file to save time.


    // some help code, remember mn, pwd, lang to cookie, and autofill.
    document.getElementById("display_name").value =
        "CDN" +
        ZoomMtg.getWebSDKVersion()[0] +
        testTool.detectOS() +
        "#" +
        testTool.getBrowserInfo();
    document.getElementById("meeting_number").value =
        testTool.getCookie("meeting_number");
    document.getElementById("meeting_pwd").value =
        testTool.getCookie("meeting_pwd");
    if (testTool.getCookie("meeting_lang"))
        document.getElementById("meeting_lang").value =
            testTool.getCookie("meeting_lang");

    document
        .getElementById("meeting_lang")
        .addEventListener("change", function (e) {
            testTool.setCookie(
                "meeting_lang",
                document.getElementById("meeting_lang").value
            );
            testTool.setCookie(
                "_zm_lang",
                document.getElementById("meeting_lang").value
            );
        });
    // copy zoom invite link to mn, autofill mn and pwd.
    document
        .getElementById("meeting_number")
        .addEventListener("input", function (e) {
            var tmpMn = e.target.value.replace(/([^0-9])+/i, "");
            if (tmpMn.match(/([0-9]{9,11})/)) {
                tmpMn = tmpMn.match(/([0-9]{9,11})/)[1];
            }
            var tmpPwd = e.target.value.match(/pwd=([\d,\w]+)/);
            if (tmpPwd) {
                document.getElementById("meeting_pwd").value = tmpPwd[1];
                testTool.setCookie("meeting_pwd", tmpPwd[1]);
            }
            document.getElementById("meeting_number").value = tmpMn;
            testTool.setCookie(
                "meeting_number",
                document.getElementById("meeting_number").value
            );
        });

    // var joinMeetingButton = document.getElementById("join_meeting");
    // joinMeetingButton.removeEventListener("click", joinMeetingHandler);

    function joinMeetingHandler(dados) {
        return new Promise((resolve, reject) => {
            // e.preventDefault();
            var meetingConfig = testTool.getMeetingConfig(dados);
            var CLIENT_ID = meetingConfig.sdkkey;
            var CLIENT_SECRET = meetingConfig.client_secret;
            if (!meetingConfig.mn || !meetingConfig.name) {
                alert("Meeting number or username is empty");
                return false;
            }

            testTool.setCookie("meeting_number", meetingConfig.mn);
            testTool.setCookie("meeting_pwd", meetingConfig.pwd);

            var signature = ZoomMtg.generateSDKSignature({
                meetingNumber: meetingConfig.mn,
                sdkKey: CLIENT_ID,
                sdkSecret: CLIENT_SECRET,
                role: meetingConfig.role,
                success: function (res) {
                    console.log(res);
                    meetingConfig.signature = res;
                    signatureKey = res;
                    meetingConfig.sdkKey = CLIENT_ID;
                    // var joinUrl = "/meeting.html?" + testTool.serialize(meetingConfig);
                    // console.log(joinUrl);
                    // window.location = joinUrl;
                },
            });
            setTimeout(() => {
                console.log("Lógica de adesão à reunião concluída.");
                resolve(); // Resolva a promessa quando a lógica estiver concluída
            }, 2000); //
        });
    }

    // joinMeetingButton.addEventListener("click", joinMeetingHandler);

    let params = new URLSearchParams(window.location.search);
    let idAula = params.get("idAula");
    let token  = params.get("token");

    axios.get(`http://localhost/4selet/public/api/buscas/dados-zoom/${idAula}/${token}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        let dados = response.data;
        
        $('#display_name').val(dados.titulo);
        $('#meeting_number').val(dados.id_zoom_meeting);
        $('#meeting_pwd').val(dados.password_zoom_meeting);
        $('#sdk_key').val(dados.client_id_zoom);
        $('#client_secret').val(dados.client_secret_zoom);
        $('#meeting_email').val(dados.email);
        
        joinMeetingHandler(dados)
        .then(() => {
            dados.signature = signatureKey;
            console.log('sadfjnaspijf aspdf m', dados);
            websdkready2(dados);
        })
        .catch(error => {
            console.error("Erro ao lidar com a reunião:", error);
        });
    })
    .catch(error => {
        console.error(error);
    });
}

function websdkready2(dados) {
    var testTool = window.testTool;
    // get meeting args from url
    var tmpArgs = testTool.parseQuery();
    
    var meetingConfig = {
        sdkKey: dados.client_id_zoom,
        meetingNumber: dados.id_zoom_meeting,
        userName: (function () {
            if (dados.titulo) {
                try {
                    return testTool.b64DecodeUnicode(dados.titulo);
                } catch (e) {
                    return dados.titulo;
                }
            }
            return (
                "CDN#" +
                "#" +
                testTool.detectOS() +
                "#" +
                testTool.getBrowserInfo()
            );
        })(),
        passWord: dados.password_zoom_meeting,
        leaveUrl: "/index.html",
        role: parseInt(0, 10),
        userEmail: (function () {
            try {
                return testTool.b64DecodeUnicode(dados.email);
            } catch (e) {
                return dados.email;
            }
        })(),
        lang: 'pt-PT',
        signature: dados.signature || "",
        china: 0,
    };

    // a tool use debug mobile device
    if (testTool.isMobileDevice()) {
        vConsole = new VConsole();
    }
    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    // it's option if you want to change the MeetingSDK-Web dependency link resources. setZoomJSLib must be run at first
    // ZoomMtg.setZoomJSLib("https://source.zoom.us/{VERSION}/lib", "/av"); // default, don't need call it
    if (meetingConfig.china)
        ZoomMtg.setZoomJSLib("https://jssdk.zoomus.cn/3.5.2/lib", "/av"); // china cdn option

    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    function beginJoin(signature) {
        ZoomMtg.i18n.load(meetingConfig.lang);
        ZoomMtg.init({
            leaveUrl: meetingConfig.leaveUrl,
            webEndpoint: meetingConfig.webEndpoint,
            disableCORP: !window.crossOriginIsolated, // default true
            // disablePreview: false, // default false
            externalLinkPage: "./externalLinkPage.html",
            success: function () {
                console.log(meetingConfig);
                console.log("signature", signature);

                ZoomMtg.join({
                    meetingNumber: meetingConfig.meetingNumber,
                    userName: meetingConfig.userName,
                    signature: signature,
                    sdkKey: meetingConfig.sdkKey,
                    userEmail: meetingConfig.userEmail,
                    passWord: meetingConfig.passWord,
                    success: function (res) {
                        console.log("join meeting success");
                        console.log("get attendeelist");
                        ZoomMtg.getAttendeeslist({});
                        ZoomMtg.getCurrentUser({
                            success: function (res) {
                                console.log("success getCurrentUser", res.result.currentUser);
                            },
                        });
                    },
                    error: function (res) {
                        console.log(res);
                    },
                });
            },
            error: function (res) {
                console.log(res);
            },
        });

        ZoomMtg.inMeetingServiceListener("onUserJoin", function (data) {
            console.log("inMeetingServiceListener onUserJoin", data);
        });

        ZoomMtg.inMeetingServiceListener("onUserLeave", function (data) {
            console.log("inMeetingServiceListener onUserLeave", data);
        });

        ZoomMtg.inMeetingServiceListener("onUserIsInWaitingRoom", function (data) {
            console.log("inMeetingServiceListener onUserIsInWaitingRoom", data);
        });

        ZoomMtg.inMeetingServiceListener("onMeetingStatus", function (data) {
            console.log("inMeetingServiceListener onMeetingStatus", data);
        });
    }

    beginJoin(meetingConfig.signature);
}
