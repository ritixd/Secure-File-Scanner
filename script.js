// Magic Bytes Database (First 4-8 hex characters)
const signatureDB = {
    "25504446": "PDF",
    "89504E47": "PNG",
    "FFD8FFE0": "JPG",
    "FFD8FFE1": "JPG",
    "FFD8FFEE": "JPG",
    "504B0304": "ZIP",
    "4D5A": "EXE",     // Windows Executable
    "7F454C46": "ELF", // Linux Executable
    "47494638": "GIF"
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB Limit

// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const errorDisplay = document.getElementById('errorMessage');
const scanBtn = document.getElementById('scanBtn');
const reportSection = document.getElementById('reportSection');

let selectedFile = null;

// Event Listeners
fileInput.addEventListener('change', (e) => {
    errorDisplay.classList.add('hidden');
    reportSection.classList.add('hidden');

    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        fileNameDisplay.textContent = selectedFile.name;
        
        if (selectedFile.size > MAX_FILE_SIZE) {
            errorDisplay.textContent = "File exceeds 100 MB limit. Please select a smaller file.";
            errorDisplay.classList.remove('hidden');
            scanBtn.disabled = true;
        } else {
            scanBtn.disabled = false;
        }
    }
});

scanBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    // UI Loading State
    const originalBtnText = scanBtn.textContent;
    scanBtn.textContent = "Analyzing...";
    scanBtn.disabled = true;
    reportSection.classList.add('hidden');

    try {
        await performScan(selectedFile);
    } catch (error) {
        errorDisplay.textContent = "An error occurred during analysis: " + error.message;
        errorDisplay.classList.remove('hidden');
    } finally {
        scanBtn.textContent = originalBtnText;
        scanBtn.disabled = false;
    }
});

// Main Scanning Logic
async function performScan(file) {
    const fileNameParts = file.name.split('.');
    const statedExtension = fileNameParts.length > 1 ? fileNameParts.pop().toUpperCase() : "NONE";
    const hasDoubleExtension = fileNameParts.length > 2; // e.g., resume.pdf.exe

    const magicHex = await readMagicBytes(file);
    const detectedType = identifyFileType(magicHex);
    const fileHash = await calculateHash(file);

    let riskScore = 0;
    let reasons = [];

    // Rule 1: Executable Check
    if (detectedType === "EXE" || detectedType === "ELF") {
        riskScore += 40;
        reasons.push("Binary execution capabilities detected.");
    }

    // Rule 2: Extension Mismatch
    if (detectedType !== "UNKNOWN" && statedExtension !== detectedType) {
        riskScore += 50;
        reasons.push(`Signature mismatch: Extension implies ${statedExtension}, but header indicates ${detectedType}.`);
    }

    // Rule 3: Double Extension
    if (hasDoubleExtension) {
        riskScore += 20;
        reasons.push("Multiple extensions detected (frequent evasion technique).");
    }

    if (riskScore === 0) {
        reasons.push("File header aligns with stated extension. No standard anomalies found.");
    }

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    renderReport(file.name, statedExtension, detectedType, fileHash, riskScore, reasons);
}

// Helpers
function readMagicBytes(file) {
    return new Promise((resolve, reject) => {
        // Handle files smaller than 4 bytes gracefully
        const bytesToRead = Math.min(file.size, 4);
        if (bytesToRead === 0) return resolve("");

        const reader = new FileReader();
        reader.onload = (e) => {
            const buffer = new Uint8Array(e.target.result);
            let hex = "";
            for (let i = 0; i < buffer.length; i++) {
                hex += buffer[i].toString(16).padStart(2, '0').toUpperCase();
            }
            resolve(hex);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.slice(0, bytesToRead));
    });
}

function identifyFileType(hexString) {
    if (!hexString) return "EMPTY FILE";
    
    for (const [magicStr, fileType] of Object.entries(signatureDB)) {
        if (hexString.startsWith(magicStr)) {
            return fileType;
        }
    }
    if (hexString.startsWith("4D5A")) {
        return "EXE";
    }
    return "UNKNOWN";
}

async function calculateHash(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        return "Hash calculation failed (Requires HTTPS or Localhost)";
    }
}

// UI Updater
function renderReport(fileName, ext, detected, hash, score, reasons) {
    document.getElementById('repFileName').textContent = fileName;
    document.getElementById('repExt').textContent = ext === "NONE" ? "None" : `.${ext.toLowerCase()}`;
    document.getElementById('repDetected').textContent = detected;
    document.getElementById('repHash').textContent = hash;
    document.getElementById('repScore').textContent = score;
    
    // Set Timestamp
    const now = new Date();
    document.getElementById('scanTimestamp').textContent = now.toLocaleString();

    const verdictBox = document.getElementById('verdictBox');
    const verdictText = document.getElementById('repVerdict');
    const reasonsList = document.getElementById('repReasons');

    verdictBox.className = "verdict-box";
    reasonsList.innerHTML = "";

    if (score >= 60) {
        verdictBox.classList.add('verdict-critical');
        verdictText.textContent = "High Risk";
    } else if (score > 0) {
        verdictBox.classList.add('verdict-warning');
        verdictText.textContent = "Suspicious";
    } else {
        verdictBox.classList.add('verdict-safe');
        verdictText.textContent = "Clean";
    }

    reasons.forEach(reason => {
        const li = document.createElement('li');
        li.textContent = reason;
        reasonsList.appendChild(li);
    });

    reportSection.classList.remove('hidden');
}