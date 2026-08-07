// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(1200, 700);
  
  // Refresh live data every 5 minutes (300,000 ms)
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, 300000);
  }
}

function onDataLoaded(data) {
  aquariumData = data;
  lastUpdated = new Date().toLocaleTimeString();
  console.log("Data refreshed successfully:", data);
}

function onError(err) {
  console.error("Failed to load aquarium data. Check proxy URL or network.", err);
}

function draw() {
  background(231, 245, 255, 200);

  // 1. Draw Title Header
  fill(25, 113, 194);
  textSize(30);
  textAlign(LEFT, TOP);
  text("AQUAPONICS DATA", 30, 30);

  // Display connection status
  textSize(18);
  fill(25, 113, 194);
  text("Last updated: " + (lastUpdated || "Loading..."), 30, 65);

  // 2. Render Dashboard Graphics
  if (aquariumData) { // data from API listed here:
    let temp = aquariumData[0].exps.temperature.curr; //ranges work, may want to change colours later on
    let ph = aquariumData[0].exps.ph.curr; //if this value is > 8, warning is displayed
    let nh3 = aquariumData[0].exps.nh3.curr;
    let nh4 = aquariumData[0].exps.nh4.curr;
    let o2 = aquariumData[0].exps.o2.curr;
    let lux = aquariumData[0].exps.lux.curr;
    let historyData = aquariumData[0].exps.HistoryData;

    // Call your custom graphic widgets
    drawTempWidget(30, 110, temp);
    drawPHWidget(30, 280, "pH Level", ph, 6.0, 8.5);
    drawGaugeWidget(550, 120, "Ammonia (NH3)", nh3, 0.0, 0.05);
    drawGaugeWidget(550, 280, "Nitrate (NH4)", nh4, 0.0, 1.0);
    drawGaugeWidget(300, 280, "Oxygen (O2)", o2, 0.0, 10.0);
    drawGaugeWidget(300, 280, "Lux", lux, 0, 10000);
    drawTempHistoryWidget(400, 420, aquariumData[0].exps.HistoryData);

  } else {
    // Loading State
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }
}

// TEMPERATURE CARD
function drawTempWidget(x, y, tempVal) {
  // Background
  if (tempVal > 28) {
    fill(255, 0, 0); // Red for wrong temp 
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(255);
    textSize(20);
    text("Water Temp", x + 15, y + 15);
    text("WARNING: HIGH \nTEMP DETECTED", x + 15, y + 40);
    textSize(36);
    text(tempVal + "°C", x + 15, y + 95);
  }
  else if (tempVal < 20) {
    fill(255, 0, 0); // Red for wrong temp
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(255);
    textSize(20);
    text("Water Temp", x + 15, y + 15);
    text("WARNING: LOW \nTEMP DETECTED", x + 15, y + 40);
    textSize(36);
    text(tempVal + "°C", x + 15, y + 95);
  }
  else if (tempVal >= 20 && tempVal < 22 || tempVal > 26 && tempVal <= 28) {
    fill(255, 255, 0); // Yellow for outside target range 
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(0);
    textSize(20);
    text("Water Temp", x + 15, y + 15);
    text("OUTSIDE TARGET \nRANGE", x + 15, y + 40);
    textSize(36);
    text(tempVal + "°C", x + 15, y + 95);
  }
  else {
    fill(165, 216, 255);
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(25, 113, 194);
    fill(255);
    textSize(20);
    text("Water Temp", x + 15, y + 15);
    textSize(36);
    text(tempVal + "°C", x + 15, y + 50);
  }
}
// pH individual widget
function drawPHWidget(x, y, label, val, minVal, maxVal) {
  if (val >= 8) {
    fill(255, 0, 0);
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(255);
    textSize(20);
    text(label, x + 15, y + 15);
    fill(255);
    text("WARNING: HIGH \npH DETECTED", x + 15, y + 45);
    textSize(36);
    text(val + " pH", x + 15, y + 95);
  } 
  else {
    fill(165, 216, 255);
    noStroke();
    rect(x, y, 200, 150, 10);
    fill(25, 113, 194);
    textSize(20);
    text(label, x + 15, y + 15);
    fill(255);
    textSize(36);
    text(val + " pH", x + 15, y + 50);
}
}

// Example Widget Function: Simple Bar Gauge
function drawGaugeWidget(x, y, label, val, minVal, maxVal) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 200, 150, 10);

  noStroke();
  fill(25, 113, 194);
  textSize(20);
  text(label, x + 15, y + 15);

  fill(255);
  textSize(28);
  text(val, x + 15, y + 50);
}

function drawTempHistoryWidget(x, y, historyData) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 700, 150, 10);

  noStroke();
  fill(25, 113, 194);
  textSize(20);
  text("Temperature History", x + 15, y + 15);
}
