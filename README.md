# 🛡️ Secure File Scanner

A lightweight, enterprise-grade, client-side security tool designed to analyze files for hidden threats, verify binary signatures, and generate cryptographic hashes entirely within the browser. 

Unlike cloud-based scanners, **Secure File Scanner processes everything locally**. No files are ever uploaded to a server, ensuring 100% data privacy and zero network latency.

## ✨ Features

* **🔒 Local Processing:** Utilizes the HTML5 `FileReader` API to analyze files directly on the user's machine.
* **🕵️ Magic Byte Detection:** Reads the first 4-8 bytes of a file's binary header to identify its true format, bypassing easily spoofed file extensions.
* **⚠️ Threat Heuristics:** Calculates a dynamic **Risk Score (0-100)** based on:
  * Detection of executable binaries (`.exe`, `.elf`).
  * Signature mismatches (e.g., an executable disguised as a `.pdf`).
  * Double extension evasion techniques (e.g., `document.pdf.exe`).
* **🔑 Cryptographic Hashing:** Generates a **SHA-256 hash** using the Web Crypto API, allowing users to cross-reference files against known malware databases (like VirusTotal).
* **🎨 Enterprise UI:** A clean, responsive, and accessible interface with clear visual indicators for Safe, Suspicious, and High-Risk files.
* **🛡️ Built-in Safeguards:** Includes a 100MB file size limit and graceful edge-case handling to prevent browser memory crashes.

## 🛠️ Tech Stack

This project is built using pure, vanilla web technologies with zero external dependencies:
* **HTML5:** Semantic structure and File Input handling.
* **CSS3:** Custom properties (variables), CSS Grid/Flexbox, and responsive design.
* **Vanilla JavaScript (ES6+):** Asynchronous DOM manipulation, Web Crypto API, and Binary Array buffers.

## 🚀 Getting Started

Since this is a client-side application, no build tools or servers are required.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/Secure-File-Scanner.git](https://github.com/yourusername/Secure-File-Scanner.git)
