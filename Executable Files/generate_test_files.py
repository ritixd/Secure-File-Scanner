import os

print("Generating safe dummy files for testing...")

# 1. The Disguised Executable (Fake PDF)
# We write the Windows EXE magic bytes (4D 5A) but name it .pdf
with open("urgent_invoice.pdf", "wb") as f:
    f.write(b'\x4D\x5A\x90\x00\x03\x00\x00\x00') # EXE Header
    f.write(b'This is just harmless text padding to simulate file size.')
print("[-] Created: urgent_invoice.pdf (Contains EXE header)")

# 2. The Double Extension (Executable disguised as Excel)
# We write the EXE header and give it a deceptive double extension
with open("salary_report.xlsx.exe", "wb") as f:
    f.write(b'\x4D\x5A\x90\x00\x03\x00\x00\x00') # EXE Header
    f.write(b'Harmless padding.')
print("[-] Created: salary_report.xlsx.exe (Double extension)")

# 3. The Safe Baseline (Real PNG)
# We write valid PNG magic bytes and name it .png
with open("company_logo.png", "wb") as f:
    f.write(b'\x89\x50\x4E\x47\x0D\x0A\x1A\x0A') # PNG Header
    f.write(b'Harmless image padding.')
print("[-] Created: company_logo.png (Safe file)")

print("\nDone! Upload these files to your web scanner to test the logic.")