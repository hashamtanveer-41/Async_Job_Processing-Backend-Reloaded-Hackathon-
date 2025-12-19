#  Motia Async AI Task Engine

> **Backend Reloaded Hackathon Submission**
> A production-grade, event-driven backend system demonstrating high-performance async workflows, resilience, and state management.

##  The Problem
Long-running tasks (like AI generation or video rendering) block standard HTTP APIs, leading to timeouts and poor user experience.

##  The Solution
I built a **Non-Blocking Async System** using **Motia**.
It decouples the API from the worker using events, manages distributed state for real-time progress, and implements advanced patterns like "Self-Healing" and "Inter-Process Cancellation."

##  Key Features (Technical Excellence)

### 1.  Asynchronous Architecture
- **Non-blocking API:** Returns a Job ID in <10ms.
- **Background Workers:** Heavy lifting happens in a detached event loop.

### 2.  Resilience (Self-Healing)
- **Chaos Mode:** The worker simulates random crashes.
- **Auto-Retries:** If a job fails, the system automatically detects it and retries up to 3 times with backoff logic.

### 3.  Control (Job Cancellation)
- Users can abort running jobs via `POST /ai/cancel`.
- The worker constantly checks state signals to stop execution immediately.

### 4.  Observability & Progress
- **Real-time updates:** Jobs report `0%` -> `50%` -> `100%` status to the state.
- **Metrics:** Automatically tracks execution duration (ms).

### 5.  Security (Rate Limiting)
- Implements a **Fixed Window Rate Limiter**.
- Limits users to 2 concurrent jobs per minute to prevent abuse.

##  Architecture
* **API Step (`StartAIJob`):** Validates input, checks rate limits, initializes state, emits event.
* **Event Step (`ProcessAIJob`):** Listens for events, processes logic, updates state, handles retries.
* **API Step (`CancelAIJob`):** Intercepts cancellation requests and signals the worker.
* **API Step (`CheckJobStatus`):** Serves real-time data to the client.

##  How to Run
1.  **Install:** `npm install`
2.  **Start:** `npm run dev`
3.  **Start Job:** ```bash
    curl -X POST http://localhost:3000/ai/start -H "Content-Type: application/json" -d '{"prompt": "Hello Judges"}'
    ```
4.  **Cancel Job:**
    ```bash
    curl -X POST http://localhost:3000/ai/cancel -H "Content-Type: application/json" -d '{"jobId": "<YOUR_JOB_ID>"}'
    ```
5.  **View Progress:** Open `http://localhost:3000/ai/status/<JOB_ID>`