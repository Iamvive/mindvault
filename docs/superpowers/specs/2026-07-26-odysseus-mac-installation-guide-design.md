# Odysseus Hardware-Tuned macOS Installation Guide Design

## Overview
This document specifies the design for a hardware-optimized installation guide and configuration reference for running **[Odysseus](https://github.com/odysseus-dev/odysseus)** natively on macOS Apple Silicon systems with 16 GB of Unified Memory.

## Target System Specifications
- **Operating System**: macOS (Apple Silicon: M1/M2/M3/M4)
- **CPU**: 8 Cores
- **Unified Memory**: 16 GB RAM
- **Primary Goal**: Achieve maximum local AI inference performance using Apple Silicon Metal GPU acceleration while maintaining system stability and low memory contention.

---

## Key Design Principles & Constraints

1. **Native Execution over Docker**:
   - Docker on macOS runs within a Linux VM and lacks passthrough access to Apple Silicon Metal GPUs. Running Odysseus in Docker forces local LLMs to run on CPU.
   - Running natively via `./start-macos.sh` grants direct Metal API access to `llama.cpp`, accelerating token generation by 5x-10x.

2. **16 GB Memory Allocation Rules**:
   - macOS core services & background apps: ~4 GB reserved.
   - Max recommended VRAM allocation for local LLMs: **~10-11 GB**.
   - Model quantizations must fit safely within this threshold (primarily 4-bit `Q4_K_M` or 5-bit `Q5_K_M` quantizations up to 14B parameter models).

---

## Installation & Guide Content Structure

The generated guide (`docs/odysseus-mac-setup-guide.md`) will contain:

### 1. Prerequisites & Toolchain Setup
- Installation of Homebrew tools:
  ```bash
  brew install python@3.11 tmux git
  ```
- Verification of Apple Silicon Metal support and PyTorch MPS availability.

### 2. Repository Cloning & Environment Setup
- Cloning repository:
  ```bash
  git clone https://github.com/odysseus-dev/odysseus.git
  cd odysseus
  ```
- Virtual environment creation & dependency installation:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python setup.py
  ```

### 3. Environment Configuration (`.env`)
- Setting explicit application parameters:
  - `APP_BIND=127.0.0.1` (or `0.0.0.0` for trusted LAN/Tailscale access)
  - `APP_PORT=7860` (default native script port) or `7000`
  - Admin account pre-seeding rules & temporary password output handling.

### 4. Hardware-Aware Local Model Recommendation Table (16 GB RAM)

| Model | Parameter Count | Quantization | Approx VRAM | Tok/sec (Est) | Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Llama-3.1-8B-Instruct** | 8B | `Q4_K_M` | 4.9 GB | ~45 tok/s | Fast general chat & function calling |
| **Qwen-2.5-7B-Instruct** | 7B | `Q5_K_M` | 5.5 GB | ~40 tok/s | Excellent reasoning & code generation |
| **Qwen-2.5-Coder-14B** | 14B | `Q4_K_M` | 9.2 GB | ~22 tok/s | Advanced coding & multi-file agents |
| **Mistral-7B-Instruct-v0.3** | 7B | `Q4_K_M` | 4.5 GB | ~50 tok/s | Low latency quick answers |

*Note: Models > 14B (e.g. 32B or 70B) are explicitly flagged to avoid system swap slowdowns.*

### 5. Execution & macOS App Wrapper
- Native startup script invocation: `./start-macos.sh`
- Optional creation of a double-clickable macOS Application using `./build-macos-app.sh`.
- Troubleshooting common issues (port conflicts, `tmux` session detached, initial admin password retrieval).

---

## Deliverables & File Locations
1. Design Spec: `docs/superpowers/specs/2026-07-26-odysseus-mac-installation-guide-design.md`
2. Installation Guide: `docs/odysseus-mac-setup-guide.md`

---

## Verification Plan
1. Validate command syntax against Odysseus repository requirements.
2. Confirm memory estimates match 16 GB Apple Silicon unified memory constraints.
