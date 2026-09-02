// ===================================================
// STUDENT TASK: Build a graphical dashboard for Seneye
// ===================================================

// Replace this with your teacher's Cloudflare Worker URL:
const PROXY_URL = "https://seneye-proxy.ezankov.workers.dev/";

// Toggle to true if you are working offline without network access
const USE_OFFLINE_MOCK = false;

let aquariumData = null;
let lastUpdated = "";
let phHistory = [];

const DASHBOARD_WIDTH = 1180;
const DASHBOARD_HEIGHT = 770;
const MAX_HISTORY_POINTS = 24;

function preload() {
  // Load initial data before setup() runs
  let endpoint = USE_OFFLINE_MOCK ? "sample-data.json" : PROXY_URL;
  aquariumData = loadJSON(endpoint, onDataLoaded, onError);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  const savedPHHistory = localStorage.getItem("seneye-ph-history");
  if (savedPHHistory) {
    try {
      phHistory = JSON.parse(savedPHHistory);
    } catch (err) {
      console.warn("Saved pH history was invalid, starting fresh.", err);
      phHistory = [];
    }
  }
  
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

  if (data && data[0] && data[0].exps && data[0].exps.ph && data[0].exps.ph.curr !== undefined) {
    const currentPH = Number(data[0].exps.ph.curr);
    if (!Number.isNaN(currentPH)) {
      phHistory.push({
        time: new Date().toISOString(),
        ph: currentPH
      });

      if (phHistory.length > MAX_HISTORY_POINTS) {
        phHistory.shift();
      }

      localStorage.setItem("seneye-ph-history", JSON.stringify(phHistory));
    }
  }

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
    drawPHWidget(20, 270, "pH Level", ph, phStatus, phTrend);
    drawNH3Widget(20, 430, "Ammonia (NH3)", nh3, nh3Status, nh3Trend);
    drawNH4Widget(85, 590, "Nitrate (NH4)", nh4, nh4Status, nh4Trend);
    drawOxyWidget(305, 590, "Oxygen (O2)", o2, o2Status, o2Trend);

    drawTempHistoryWidget(240, 110);
    drawPHWidget2(240, 270, phHistory);
    drawNH3HLevelWidget(240, 430, "Ammonia (NH3)", nh3); 
    drawWarningWidget(610, 110, tempStatus, phStatus, nh3Status, nh4Status, o2Status);
    drawLargeDataWidget(610, 430, temp, ph, nh3, nh4, o2);

  } else {
    // Loading State
    fill(255, 100, 100);
    textSize(18);
    text("Connecting to sensor stream...", 30, 120);
  }

  pop();
}

// TEMPERATURE CARD -> Warning messages set to appear under value if status = 1, also shows trend messages
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

// pH individual widget -> Warning messages copied from temp widget
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

// nh3 individual widget -> warning messages for high ammonia levels copied from temp widget
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

// nh4 individual widget -> warning messaged added, same as temp widget
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

// o2 individual widget -> warning messages added from temp widget
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

// pH level further data widget using live API readings collected over time
function drawPHWidget2(x, y, historyData) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);

  fill(25, 113, 194);
  textSize(20);
  text("pH Level History", x + 15, y + 15);

  // Graph area and axes
  const gx = x + 55;
  const gy = y + 110;
  const gw = 240;
  const gh = 75;

  stroke(0);
  strokeWeight(2);
  line(gx, gy - gh, gx, gy);
  line(gx, gy, gx + gw, gy);

  noStroke();
  textSize(12);
  fill(25, 113, 194);
  push();
  translate(x + 12, y + 95);
  rotate(-PI / 2);
  textStyle(BOLD);
  text("pH Level", 0, 0);
  pop();
  textStyle(BOLD);
  text("Time", x + 165, y + 125);
  textStyle(NORMAL);

  if (!historyData || historyData.length === 0) return;

  const values = historyData.map(item => (typeof item === "object" ? Number(item.ph) : Number(item)));
  const padding = 0.8;
  const minPH = min(values) - padding;
  const maxPH = max(values) + padding;

  // Y-axis tick labels
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const value = minPH + (i / yTicks) * (maxPH - minPH);
    const py = gy - (i / yTicks) * gh;
    fill(25, 113, 194);
    noStroke();
    textSize(10);
    text(value.toFixed(1), gx - 20, py + 4);
    stroke(180);
    strokeWeight(1);
    line(gx, py, gx + gw, py);
  }

  // X-axis tick labels showing time
  const xTicks = Math.min(historyData.length, 5);
  for (let i = 0; i <= xTicks; i++) {
    const index = Math.round((i / xTicks) * (historyData.length - 1));
    const px = gx + (index / Math.max(1, historyData.length - 1)) * gw + 10;
    const entry = historyData[index];
    const ts = entry && entry.time ? new Date(entry.time) : null;
    fill(25, 113, 194);
    noStroke();
    textSize(9);
    if (ts) {
      text(ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), px - 10, gy + 8);
    } else {
      text(i + 1, px - 3, gy + 7);
    }
  }

  noFill();
  stroke(25, 113, 194);
  strokeWeight(3);
  beginShape();
  for (let i = 0; i < values.length; i++) {
    const px = gx + (i / Math.max(1, values.length - 1)) * gw;
    const py = gy - map(values[i], minPH, maxPH, 0, gh);
    vertex(px, py);
  }
  endShape();

  // Draw point markers and labels
  fill(25, 113, 194);
  noStroke();
  for (let i = 0; i < values.length; i++) {
    const px = gx + (i / Math.max(1, values.length - 1)) * gw;
    const py = gy - map(values[i], minPH, maxPH, 0, gh);
    circle(px, py, 4);
    if (i === values.length - 1) {
      textSize(10);
      text(values[i].toFixed(2) + " pH", px + 6, py - 8);
    }
  }
}

// NH3 history widget
function drawNH3HLevelWidget(x, y, label, val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 355, 140, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Ammonia (NH3) Level", x + 15, y + 15);
  textSize(14);
  textStyle(BOLD);
  text("Current Ammonia Level (mg/L)", x + 77, y + 120);
  textStyle(NORMAL);
  textSize(12);
  text("0.0", x + 10, y +105);
  text("0.01", x + 40, y + 105);
  text("0.02", x + 80, y + 105);
  text("0.03", x + 120, y + 105);
  text("0.04", x + 160, y + 105);
  text("0.05", x + 200, y + 105);
  text("0.06", x + 240, y + 105);
  text("0.07", x + 280, y + 105);
  text("0.08", x + 320, y + 105);
  fill(231, 245, 255, 200);
  rect(x + 15, y + 50, 325, 50);
  newVal = Number(val).toFixed(2);
  newVal = Number(newVal);
  if (newVal === 0.00) {
    fill(0, 128, 0);
    rect(x + 15, y + 50, 5, 50);
    fill(25, 113, 194);
    text(val, x + 25, y + 70);
  }
  else if (newVal === 0.01) {
    fill(0, 128, 0);
    rect(x + 15, y + 50, 40, 50);
    fill(25, 113, 194);
    text(val, x + 60, y + 70);
  }
  else if (newVal === 0.02) {
    fill(0, 128, 0);
    rect(x + 15, y + 50, 80, 50);
    fill(25, 113, 194);
    text(val, x + 100, y + 70);
  }
  else if (newVal === 0.03) {
    fill(255, 255, 0);
    rect(x + 15, y + 50, 120, 50);
    fill(25, 113, 194);
    text(val, x + 140, y + 70);
  }
  else if (newVal === 0.04) {
    fill(255, 255, 0);
    rect(x + 15, y + 50, 160, 50);
    fill(25, 113, 194);
    text(val, x + 180, y + 70);
  }
  else if (newVal === 0.05) {
    fill(255, 255, 0);
    rect(x + 15, y + 50, 200, 50);
    fill(25, 113, 194);
    text(val, x + 220, y + 70);
  }
  else if (newVal === 0.06) {
    fill(255, 0, 0);
    rect(x + 15, y + 50, 240, 50);
    fill(25, 113, 194);
    text(val, x + 260, y + 70);
  }
  else if (newVal === 0.07) {
    fill(255, 0, 0);
    rect(x + 15, y + 50, 280, 50);
    fill(231, 245, 255, 200);
    text(val, x + 260, y + 70);
  }
  else if (newVal >= 0.08) {
    fill(255, 0, 0);
    rect(x + 15, y + 50, 320, 50);
    fill(231, 245, 255, 200);
    text(val, x + 300, y + 70);
  }
}

// widget for displaying any warnings
function drawWarningWidget(x, y, tempStatus, phStatus, nh3Status, nh4Status, o2Status) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 575, 300, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Warning Messages", x + 15, y + 15);
  textSize(16);
  text("Any warnings that need addressing will be displayed below", x + 15, y + 45);
  let warningMessages = [];
  if (tempStatus === "1") warningMessages.push("WARNING: Water temp out of \nrange");
  if (phStatus === "1") warningMessages.push("WARNING: pH level out of \nrange");
  if (nh3Status === "1") warningMessages.push("WARNING: Ammonia (NH3) \nlevel out of range");
  if (nh4Status === "1") warningMessages.push("WARNING: Nitrate (NH4) level \nout of range");
  if (o2Status === "1") warningMessages.push("WARNING: Oxygen (O2) level \nout of range");
  //displaywarningMessages(warningMessages, x + 15, y + 70);
  fill(255, 0, 0);
  textSize(40);
  text(warningMessages.join("\n"), x + 15, y + 70);
}

// time values outside widget
let value = 0
let lastSecond = 0

// widget for flipping between LARGE data values :)
function drawLargeDataWidget(x, y, tempVal, phVal, nh3Val, nh4Val, o2Val) {
  fill(165, 216, 255);
  noStroke();
  rect(x, y, 575, 300, 10);
  fill(25, 113, 194);
  textSize(20);
  text("Large Data Values", x + 15, y + 15);

  if (millis() - lastSecond >= 5000) {
    value++;
    lastSecond = millis();

    if (value > 4) {
      value = 0;
    }
  }
  
  if (value === 0) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(25, 113, 194);
    text("Water Temp:", x + 575 / 2, y + 100);
    textSize(100);
    text(tempVal + "°C", x + 575 / 2, y + 190);
  } 
  else if (value === 1) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(25, 113, 194);
    text("pH Level:", x + 575 / 2, y + 100);
    textSize(100);
    text(phVal + " pH", x + 575 / 2, y + 190);
  }
  else if (value === 2) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(25, 113, 194);
    text("Ammonia (NH3):", x + 575 / 2, y + 100);
    textSize(100);
    text(nh3Val + " mg/L", x + 575 / 2, y + 190);
  }
  else if (value === 3) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(25, 113, 194);
    text("Nitrate (NH4):", x + 575 / 2, y + 100);
    textSize(100);
    text(nh4Val + " mg/L", x + 575 / 2, y + 190);
  }
  else if (value === 4) {
    textSize(70);
    textAlign(CENTER, CENTER);
    fill(25, 113, 194);
    text("Oxygen (O2):", x + 575 / 2, y + 100);
    textSize(100);
    text(o2Val + " mg/L", x + 575 / 2, y + 190);
  }
  }