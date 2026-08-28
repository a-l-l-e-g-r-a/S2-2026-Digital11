// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";

const DASHBOARD_WIDTH = 1180;
const DASHBOARD_HEIGHT = 770;

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Refresh live data every 5 minutes (300,000 ms)
  if (!USE_OFFLINE_MOCK) {
    setInterval(() => {
      loadJSON(PROXY_URL, onDataLoaded, onError);
    }, 300000);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

  const scaleFactor = min(width / DASHBOARD_WIDTH, height / DASHBOARD_HEIGHT);
  push();
  translate((width - DASHBOARD_WIDTH * scaleFactor) / 2, (height - DASHBOARD_HEIGHT * scaleFactor) / 2);
  scale(scaleFactor);

  // 1. Draw Title Header
  fill(25, 113, 194);
  textSize(30);
  textAlign(LEFT, TOP);
  text("SILVERPERCH AQUAPONICS DATA", 20, 30);

  // Display connection status
  textSize(18);
  fill(25, 113, 194);
  text("Last updated: " + (lastUpdated || "Loading..."), 20, 70);

  // 2. Render Dashboard Graphics
  if (aquariumData) { // data from API listed here:
    let temp = aquariumData[0].exps.temperature.curr; // Current data values
    let ph = aquariumData[0].exps.ph.curr; 
    let nh3 = aquariumData[0].exps.nh3.curr;
    let nh4 = aquariumData[0].exps.nh4.curr;
    let o2 = aquariumData[0].exps.o2.curr;
    let tempStatus = aquariumData[0].exps.temperature.status; // status of each value
    let phStatus = aquariumData[0].exps.ph.status;
    let nh3Status = aquariumData[0].exps.nh3.status;
    let nh4Status = aquariumData[0].exps.nh4.status;
    let o2Status = aquariumData[0].exps.o2.status;
    let tempTrend = aquariumData[0].exps.temperature.trend; // Trend to tell if values are increasing or decreasing
    let phTrend = aquariumData[0].exps.ph.trend;
    let nh3Trend = aquariumData[0].exps.nh3.trend;
    let nh4Trend = aquariumData[0].exps.nh4.trend;
    let o2Trend = aquariumData[0].exps.o2.trend;

    // Call your custom graphic widgets
    drawTempWidget(20, 110, temp, tempStatus, tempTrend);
    drawPHWidget(20, 280, "pH Level", ph, phStatus, phTrend);
    drawNH3Widget(20, 450, "Ammonia (NH3)", nh3, nh3Status, nh3Trend);
    drawNH4Widget(20, 620, "Nitrate (NH4)", nh4, nh4Status, nh4Trend);
    drawOxyWidget(605, 110, "Oxygen (O2)", o2, o2Status, o2Trend);

    drawTempHistoryWidget(240, 110);
    drawPHWidget2(240, 280);
    drawNH3HistoryWidget(240, 450); 
    drawNH4HistoryWidget(240, 620);
    drawOxyHistoryWidget(825, 110);

  } else {
    // Loading State
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }

  pop();
}

// TEMPERATURE CARD -> Warning messages set to appear under value if 
// outside target range -> prolly should change this to use the status
function drawTempWidget(x, y, tempVal, tempStatus, tempTrend) {
  // Background
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Water Temp", x + 15, y + 12);
  textSize(36);
  text(tempVal + "°C", x + 15, y + 42);
  if (tempStatus === "1") {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING", x + 15, y + 113);
  }
  if (tempTrend === "0") {
    fill(25, 113, 194);
    textSize(20);
    text("TEMP STABLE", x + 15, y + 87);
  } 
  else if (tempTrend === "-1") {
    fill(25, 113, 194);
    textSize(20);
    text("TEMP DECREASING", x + 15, y + 87);
  }
  else if (tempTrend === "1") {
    fill(25, 113, 194);
    textSize(20);
    text("TEMP INCREASING", x + 15, y + 87);
  }
}

// pH individual widget -> Warning messages
function drawPHWidget(x, y, label, val, phStatus, phTrend) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("pH Level", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " pH", x + 15, y + 42);
  if (phStatus === "1") {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING", x + 15, y + 113);
  }
  if (phTrend === "0") {
    fill(25, 113, 194);
    textSize(20);
    text("pH STABLE", x + 15, y + 87);
  }
  else if (phTrend === "-1") {
    fill(25, 113, 194);
    textSize(20);
    text("pH DECREASING", x + 15, y + 87);
  }
  else if (phTrend === "1") {
    fill(25, 113, 194);
    textSize(20);
    text("pH INCREASING", x + 15, y + 87);
  }
}

// nh3 individual widget -> warning messages for high ammonia levels
function drawNH3Widget(x, y, label, val, nh3Status, nh3Trend) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Ammonia (NH3)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
  if (nh3Status === "1") {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING", x + 15, y + 113);
  }
  else if (nh3Trend === "0") {
    fill(25, 113, 194);
    textSize(20);
    text("NH3 STABLE", x + 15, y + 87);
  }
  else if (nh3Trend === "-1") {
    fill(25, 113, 194);
    textSize(20);
    text("NH3 DECREASING", x + 15, y + 87);
  }
  else if (nh3Trend === "1") {
    fill(25, 113, 194);
    textSize(20);
    text("NH3 INCREASING", x + 15, y + 87);
  }
}

// nh4 individual widget -> ADD WARNING MESSAGES
function drawNH4Widget(x, y, label, val, nh4Status, nh4Trend) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Nitrate (NH4)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
  if (nh4Status == "1") {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING", x + 15, y + 113);
  }
  if (nh4Trend == "0") {
    fill(25, 113, 194);
    textSize(20);
    text("NH4 STABLE", x + 15, y + 87);
  }
  else if (nh4Trend == "-1") {
    fill(25, 113, 194);
    textSize(20);
    text("NH4 DECREASING", x + 15, y + 87);
  }
  else if (nh4Trend == "1") {
    fill(25, 113, 194);
    textSize(20);
    text("NH4 INCREASING", x + 15, y + 87);
  }
}

// o2 individual widget -> ADD WARNING MESSAGES
function drawOxyWidget(x, y, label, val, oxyStatus, oxyTrend) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Oxygen (O2)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
  if (oxyStatus == "1") {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING", x + 15, y + 113);
  }
  if (oxyTrend == "0") {
    fill(25, 113, 194);
    textSize(20);
    text("O2 STABLE", x + 15, y + 87);
  }
  else if (oxyTrend == "-1") {
    fill(25, 113, 194);
    textSize(20);
    text("O2 DECREASING", x + 15, y + 87);
  }
  else if (oxyTrend == "1") {
    fill(25, 113, 194);
    textSize(20);
    text("O2 INCREASING", x + 15, y + 87);
  }
}

// temp history widget -> need to actually add the history data
function drawTempHistoryWidget(x, y, historyData) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Temperature History", x + 15, y + 15);
}

// pH level further data widget :)
function drawPHWidget2(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("pH Level History", x + 15, y + 15);
}

// NH3 history widget
function drawNH3HistoryWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Ammonia (NH3) History", x + 15, y + 15);
}

// NH4 history widget
function drawNH4HistoryWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10); 
  fill(25, 113, 194);
  textSize(20);
  text("Nitrate (NH4) History", x + 15, y + 15);
}

// Oxygen history widget
function drawOxyHistoryWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Oxygen (O2) History", x + 15, y + 15);
}