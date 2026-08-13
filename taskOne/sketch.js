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
  text("SILVERPERCH AQUAPONICS DATA", 20, 20);

  // Display connection status
  textSize(18);
  fill(25, 113, 194);
  text("Last updated: " + (lastUpdated || "Loading..."), 20, 55);

  // 2. Render Dashboard Graphics
  if (aquariumData) { // data from API listed here:
    let temp = aquariumData[0].exps.temperature.curr; 
    let ph = aquariumData[0].exps.ph.curr; 
    let nh3 = aquariumData[0].exps.nh3.curr;
    let nh4 = aquariumData[0].exps.nh4.curr;
    let o2 = aquariumData[0].exps.o2.curr;

    // Call your custom graphic widgets
    drawTempWidget(20, 90, temp);
    drawPHWidget(20, 240, "pH Level", ph, 6.0, 8.5);
    drawNH3Widget(20, 390, "Ammonia (NH3)", nh3, 0.0, 0.05);
    drawNH4Widget(20, 540, "Nitrate (NH4)", nh4, 0.0, 1.0);
    drawOxyWidget(605, 90, "Oxygen (O2)", o2, 0.0, 10.0);
    drawTempHistoryWidget(240, 90);
    drawPHWidget2(240, 240);
    drawNH3HistoryWidget(240, 390); 
    drawNH4HistoryWidget(240, 540);
    drawOxyHistoryWidget(815, 90);

  } else {
    // Loading State
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }
}

// TEMPERATURE CARD -> Warning messages set to appear under value if outside target range
function drawTempWidget(x, y, tempVal) {
  // Background
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Water Temp", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(tempVal + "°C", x + 15, y + 42);
  if (tempVal > 28) {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING: HIGH \nTEMP DETECTED", x + 15, y + 87);
  }
  else if (tempVal < 20) {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING: LOW \nTEMP DETECTED", x + 15, y + 87);
  }
  else if (tempVal >= 20 && tempVal < 22 || tempVal > 26 && tempVal <= 28) {
    fill(255, 255, 0);
    textSize(20);
    text("OUTSIDE TARGET \nRANGE", x + 15, y + 87);
  }

}

// pH individual widget -> Warning messages
function drawPHWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("pH Level", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " pH", x + 15, y + 42);
  if (val > 8.2) {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING: HIGH \npH DETECTED", x + 15, y + 87);
  }
  else if (val < 6.5) {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING: LOW \npH DETECTED", x + 15, y + 87);
  }
  else if (val >= 6.5 && val < 6.8 || val > 7.8 && val <= 8.2) {
    fill(255, 255, 0);
    textSize(20);
    text("OUTSIDE TARGET \nRANGE", x + 15, y + 87);
  }
}

// nh3 individual widget -> warning messages for high ammonia levels
function drawNH3Widget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Ammonia (NH3)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
  if (val > 0.02 && val <= 0.05) {
    fill(255, 255, 0);
    textSize(20);
    text("OUTSIDE TARGET \nRANGE", x + 15, y + 87);
  }
  else if (val > 0.05) {
    fill(255, 0, 0);
    textSize(20);
    text("WARNING: HIGH \nAMMONIA", x + 15, y + 87);
  }
}

// nh4 individual widget -> ADD WARNING MESSAGES
function drawNH4Widget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 210, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Nitrate (NH4)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
}

// o2 individual widget -> ADD WARNING MESSAGES
function drawOxyWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 200, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Oxygen (O2)", x + 15, y + 12);
  fill(25, 113, 194);
  textSize(36);
  text(val + " mg/L", x + 15, y + 42);
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