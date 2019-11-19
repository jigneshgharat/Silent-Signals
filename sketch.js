// Posenet and Gestures - Nadine, Priya, Jignesh

let video;
let poseNet;
let poses = [];
let Gesture = []

// tracking nose
let noseX = 0;
let noseY = 0;

// tracking left eye
let lEyeX = 0;
let lEyeY = 0;

// tracking right eye
let rEyeX = 0;
let rEyeY = 0;

// tracking left wrist
let lWristX = 0;
let lWristY = 0;

// tracking right wrist
let rWristX = 0;
let rWristY = 0;

// tracking left shoulder
let lShldX = 0;
let lShldY = 0;

// tracking right shoulder
let rShldX = 0;
let rShldY = 0;

// tracking left elbow
let lElbX = 0;
let lElbY = 0;

// tracking right elbow
let rElbX = 0;
let rElbY = 0;

// Declare variable 'img'.
let imghello;
let imgthankyou;



let dataServer;

let pubKey = 'pub-c-b5a5a079-abb5-4ab9-9d14-808586f68e46';
let subKey = 'sub-c-b29084da-0184-11ea-ac43-f2bd9f9a442a';

//assign channel name. can be anything
let channelName = "sayStuff";

let incomingText = ""; //variable that will hold the incoming message text
let onScreenRcvMsg = "";
let whoAreYou;

//assign gesture variables
let gestureactive = false;
let currentGesture = "";
let prevGesture = "";
let gestureReceived;
let whosent;
let myid;

function preload() {
  Gesture[0] = loadImage('Gesture01.png');
  Gesture[1] = loadImage('Gesture02.png');
  Gesture[2] = loadImage('Gesture03.png');
  Gesture[3] = loadImage('Gesture04.png');
}

function setup() {
  //createCanvas(windowWidth, windowHeight);
  createCanvas(640, 480);
  background(255);

line(30, 20, 85, 75);
  
  // Load the image
  imghello = loadImage('hello.png');
  imgthankyou = loadImage('thankyou.png');
  // img = loadImage('Gesture-1.png'); 


  // posenet code
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', gotPoses);


  function gotPoses(poses) {
    if (poses.length > 0) {

      // TRACKING POINTS WITH LERP
      //   nose
      let nX = poses[0].pose.keypoints[0].position.x;
      let nY = poses[0].pose.keypoints[0].position.y;

      //   left eye
      let leX = poses[0].pose.keypoints[1].position.x;
      let leY = poses[0].pose.keypoints[1].position.y;

      // right eye
      let reX = poses[0].pose.keypoints[2].position.x;
      let reY = poses[0].pose.keypoints[2].position.y;

      // left wrist
      let lwX = poses[0].pose.keypoints[9].position.x;
      let lwY = poses[0].pose.keypoints[9].position.y;

      //  right wrist
      let rwX = poses[0].pose.keypoints[10].position.x;
      let rwY = poses[0].pose.keypoints[10].position.y;


      //  motion smoothing using lerp     
      noseX = lerp(noseX, nX, 0.5);
      noseY = lerp(noseY, nY, 0.5);

      lEyeX = lerp(lEyeX, leX, 0.5);
      lEyeY = lerp(lEyeY, leY, 0.5);

      rEyeX = lerp(rEyeX, reX, 0.5);
      rEyeY = lerp(rEyeY, reY, 0.5);

      lWristX = lerp(lWristX, lwX, 0.5);
      lWristY = lerp(lWristY, lwY, 0.5);

      rWristX = lerp(rWristX, rwX, 0.5);
      rWristY = lerp(rWristY, rwY, 0.5);

    }
  }

  function modelReady() {
    console.log('model ready');
  }

  function modelLoaded() {
    console.log('model loaded');
  }

  // initialize pubnub
  dataServer = new PubNub({
    publish_key: pubKey,
    subscribe_key: subKey,
    ssl: true,
    uuid: "DF" // name of my UUID
  });
  myid = dataServer.getUUID();
  console.log(myid);
  //attach callbacks to the pubnub object to handle messages and connections
  dataServer.addListener({
    message: readIncoming
  });
  dataServer.subscribe({
    channels: [channelName]
  });

  //create the text fields for the message to be sent
  sendText = createInput();
  sendText.position(5, height - 100);

  whoAreYou = createInput('NAME');
  whoAreYou.position(5, height - 120);

  sendButton = createButton('SEND');
  sendButton.position(sendText.x + sendText.width, height - 100);
  sendButton.mousePressed(sendTheMessage);
  fill(0, 100);
}


function draw()

//posenet draw
{
  background(255);
  //noStroke();
  video.size(640, 480);
  //video.size(windowWidth, windowHeight);
  image(video, 0, 0);

  
  //track wrist positions for visual reference
  ellipse(rWristX, rWristY, 10);
  ellipse(lWristX, lWristY, 10);
  line(rWristX, rWristY, lWristX, lWristY);

  //GESTURES & TEXT RESPONSES

    // hand raise
  if ((rWristY <= height / 2) && (gestureactive == false)) {
    fill(255, 0, 0);
    // ellipse(lWristX, lWristY, 100);
    textSize(32);
    text('Hello', lWristX, lWristY);

    currentGesture = "Hello";
    if (prevGesture != currentGesture) {
      sendTheMessage(currentGesture);
    }
    prevGesture = currentGesture;
    gestureactive = true;
  } else {
    gestureactive = false;
  }

 
  // hands join screen lower half - THANK YOU
  let handDist = dist(rWristX, rWristY, lWristX, lWristY);

  if ((handDist <= 80) && (gestureactive == false)) {
    fill(0, 0, 255);
    // ellipse(lWristX, lWristY - 200, 50);
    textSize(32);
    text('Thank You', lWristX, lWristY);

    currentGesture = "Thank You";
    // currentGesture = image(imgthankyou, 0, 0);

    if (prevGesture != currentGesture) {
      sendTheMessage(currentGesture);
    }
    prevGesture = currentGesture;
    gestureactive = true;
  } else {
    gestureactive = false;
  }


  // rigth hand on left shoulder - YES
  if ((rWristX => lShldX - 40) && (gestureactive == false)) {
    fill(255, 0, 0);
    // ellipse(lShldX, lShldY, 25);
    textSize(32);
    text('Yes', lShldX, lShldY);

    currentGesture = "Yes";
    if (prevGesture != currentGesture) {
      sendTheMessage(currentGesture);
    }
    prevGesture = currentGesture;
    gestureactive = true;
  } else {
    gestureactive = false;
  }


  // left raised - GOODBYE
  if ((lWristY <= height / 2) && (gestureactive == false)) {

    fill(0, 0, 255);
    // ellipse(lWristX, lWristY, 25);
    textSize(32);
    text('Goodbye', lWristX, lWristY);

    currentGesture = "Goodbye";
    if (prevGesture != currentGesture) {
      sendTheMessage(currentGesture);
    }
    prevGesture = currentGesture;
    gestureactive = true;
  } else {
    gestureactive = false;
  }


  //Text style
  noStroke();
  fill(255, 0, 0); //read the color values from the message
  textSize(25)
  text(incomingText, 18, height / 2); //Text
  fill(0, 0, 255);
  text(onScreenRcvMsg, 10, height / 4); //Gesture

}


function sendTheMessage(greetingType) {

  dataServer.publish({
    channel: channelName,
    message: {
      greeting: greetingType,
      who: whoAreYou.value(),
      messageText: sendText.value()
    }
  });

}

function readIncoming(inMessage) {
  if (inMessage.channel == channelName) {
    gestureReceived = inMessage.message.greeting;
    textSize(30)
    text(gestureReceived, width / 2, height / 2);
    whosent = inMessage.publisher;
    console.log(whosent + " said " + gestureReceived);
    if (inMessage.message.who != whoAreYou.value()) {
      incomingText = inMessage.message.who + " : " + inMessage.message.messageText;
      onScreenRcvMsg = inMessage.message.who + " : " + gestureReceived;
    }

  }
}