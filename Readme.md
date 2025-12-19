# 🚀 Async AI Task Processor (Motia Backend)

> Built for the Backend Reloaded Hackathon 2025.
> A production-grade, event-driven backend system that handles long-running AI tasks without blocking users.

## 💡 The Problem
In real-world applications (like video rendering or AI generation), tasks take time. If the API waits for the task to finish, the user gets stuck, and the server times out.

## 🛠️ The Solution
I built an **Asynchronous Job Processing System** using **Motia Steps**.
Instead of blocking the request, the API accepts the job, issues a ticket ID, and lets a background worker handle the heavy lifting.

## 🏗️ Architecture (Motia Primitives)
This project uses Motia's "Single Core Primitive" philosophy to unify the entire stack:

1.  **Start API (`start-ai-job`)**: 
    * Accepts user input.
    * Persists initial state.
    * **Emits Event:** `ai.job.created`.
    * Returns immediately (Non-blocking).
2.  **Background Worker (`process-ai-job`)**:
    * **Subscribes** to `ai.job.created`.
    * Simulates heavy AI processing.
    * **Updates State:** Tracks progress (0% -> 50% -> 100%) in real-time.
    * **Observability:** Tracks execution duration.
3.  **Status API (`check-job-status`)**:
    * Reads from Motia's distributed state.
    * Returns live progress to the user.

## ✨ Key Features (Technical Excellence)
* **⚡ Non-Blocking I/O:** APIs respond in <10ms, while jobs run for seconds.
* **📊 Real-Time Progress:** Workers report status updates (e.g., "50% - Analyzing...") to state.
* **🛡️ Chaos Engineering:** The system is designed to handle random failures (simulated crashes) gracefully without killing the server.
* **⏱️ Observability:** Every job tracks its own duration and execution history.

## 🚀 How to Run
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Start the Server:**
    ```bash
    npm run dev
    ```
3.  **Create a Job:**
    ```bash
    curl -X POST http://localhost:3000/ai/start -H "Content-Type: application/json" -d '{"prompt": "Hello Judges"}'
    ```
4.  **Check Status:**
    Visit `http://localhost:3000/ai/status/<YOUR_JOB_ID>` in your browser to see the live progress bar!