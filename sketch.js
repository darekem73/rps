// Neural Paper Rock Scisors (LSTM)
// jshint esnext: true
//

const tsLength = 10;
const learningRate = 0.1;
const marginalError = 0.9;

var network, trainer;
var decision = [1,0,0];
var human = [1,0,0];
var result = 0;
var trainingSet = [];
var previous = [1,0,0];
var trace = {
  x:[0],
  y:[0],
  type: 'scatter',
  name: 'LSTM',
};
var tries = 0;
var score = 0;
var col = 255;

function argmax(tab) {
  let m = tab.reduce((m,c) => m > c? m : c);
  let b = tab.map(x => x == m? 1 : 0);
  let c = b.reduce((a,c) => a + c);
  if (c>1) {
    console.log('error in argmax');
    return [];
  } else {
    return b;
  }
}

function onehot(c) {
  switch (c) {
    case 0: return [1,0,0];
    case 1: return [0,1,0];
    case 2: return [0,0,1];
  }
  console.log('error in onehot ' + c);
}

function compare(a,b) {
  var ai = a.reduce((a,c,i) => c > 0? i : a, 0);
  var bi = b.reduce((a,c,i) => c > 0? i : a, 0);
  if (ai === bi) {
    return 0;
  } else if ((ai === 0 && bi === 1) || 
             (ai === 1 && bi === 2) ||
             (ai === 2 && bi === 0)) {
    return -1;
  } else if ((bi === 0 && ai === 1) || 
             (bi === 1 && ai === 2) ||
             (bi === 2 && ai === 0)) {
    return 1;
  } else {
    console.log('unexpected in compare');
    return "ERR";
  }
}

function betterThan(h) {
  if (h[0] == 1) {
    return [0,1,0];  
  } else if (h[1] == 1) {
    return [0,0,1];  
  } else if (h[2] == 1) {
    return [1,0,0];  
  } else {
    console.log('unexpected in betterThan');
    return [];
  }
}

function toText(h) {
  if (h[0] == 1) {
    return "ROCK";  
  } else if (h[1] == 1) {
    return "PAPER";  
  } else if (h[2] == 1) {
    return "SCISSORS";  
  } else {
    console.log('unexpected in toText');
    return [];
  }  
}

function setup() {
  createCanvas(400,400);
  network = new synaptic.Architect.LSTM(3,20,20,3);
  trainer = new synaptic.Trainer(network);
  var data = [trace];
  Plotly.newPlot('plot', data);  
}

function runOnce(key) {
  if (key == 'Q' || key == 'A' || key == 'Z' || key == 'P') {
    col = 255;
    //console.log('----');
    var inputs = previous;
    outputs = network.activate(inputs);
    decision = argmax(outputs);
    //console.log('Me ' + toText(decision));
    switch (key) {
      case 'Q':
        //console.log('Human STONE');
        human = [1,0,0];
        break;
      case 'A':
        //console.log('Human PAPER');
        human = [0,1,0];
        break;
      case 'Z':
        //console.log('Human SCISSORS');
        human = [0,0,1];
        break;
      case 'P':
        human = onehot(floor(random(3)));
        //console.log(toText(human));
        break;
    }
    previous = human.slice(0);
    
    result = compare(decision,human);
//     if (s > 0) {
//       console.log("I win");
//     } else if (s < 0) {
//       console.log("Human wins");
//     } else {
//       console.log("Tie");
//     }
    score+=result;
    
    trainingSet.push({
      input: inputs,
      output: betterThan(human),
    });
    if (trainingSet.length > tsLength) {
      while (trainingSet.length > tsLength) {
        trainingSet.shift();
      }
    }
    
    tries++;
    trace.x.push(tries);
    trace.y.push(score);
    
    var data = [trace];
    Plotly.newPlot('plot', data);

    //network.propagate(learningRate,betterThan(human));
  }  
}

function keyPressed() {
  if (key != 'P') {
    runOnce(key);
  }
}

function draw() {
  background(51);
  noStroke();
  col = lerp(col,51,0.05);
  fill(col);
  textAlign(CENTER);
  textSize(24);
  text(toText(decision),width/4, height/2);
  text(toText(human),3*width/4, height/2);
  if (result > 0) {
    text('I win', width/2, height/4);
  } else if (result < 0) {
    text('Human wins', width/2, height/4);
  } else {
    text('Tie', width/2, height/4);
  }
  
  trainer.train(trainingSet,{
    rate: 0.1,
    iterations: 5,
    error: 0.99,
    shuffle: false,
    log: 0,
    cost: synaptic.Trainer.cost.CROSS_ENTROPY,
  });  
  if (keyIsDown(80)) {
    runOnce('P');
  }
  textAlign(LEFT);
  textSize(10);
  fill(255);
  text(frameRate(),10,10);
}
