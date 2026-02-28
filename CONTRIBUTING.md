# Contributing to PDF Q&A Bot — RAG-Powered PDF Question Answering App

Thank you for your interest in contributing to PDF Q&A Bot as part of the
GDG CHARUSAT Open Source Contri Sprintathon! 🎉

---

## 🚨 Contribution Rules (Strict Enforcement)

Read this section carefully before doing anything. Violations will result
in your PR being closed without review.

❌ Do NOT open PRs for issues unless you are officially assigned  
❌ PRs without a linked issue (or team number) will be closed immediately  
❌ PRs for unassigned issues will be closed without merging  
❌ Do NOT self-assign issues  
✅ Contributors may create new issues for bugs, enhancements, or documentation improvements, following the Issue Guidelines below  
✅ One issue per contributor at a time - finish and submit before picking another  
✅ Only maintainers can assign, review, and merge PRs - do not ask others to merge your PR  
✅ Every PR must include your Team Number in the description  
✅ General improvement PRs (bug fixes or enhancements outside existing issues) are allowed but reviewed strictly - you must still include your team number and clearly explain the change  

---

## 📌 Issue Policy

Contributors may create new issues for:

- Bugs in any of the three services (frontend, backend, RAG service)
- UI/UX inconsistencies in the React frontend
- API integration issues between Node backend and FastAPI service
- Documentation improvements
- Feature suggestions

Before creating a new issue, check that a similar issue does not already exist.  
Use clear, descriptive titles and provide proper details.  
To work on an issue, comment on it requesting assignment (e.g., "I'd like to work on this, Team XX").  
Wait for a maintainer to officially assign you before writing any code.  
Once assigned, you must submit your PR within 3-5 days or the issue will be reassigned.  
If you're stuck or unavailable, comment on the issue so maintainers can help or reassign.  

---

## 🚀 Reporting Bugs or Proposing Improvements

If you identify:

- A crash or connection error in `server.js`, `rag-service/`, or `frontend/`
- A PDF upload or processing failure
- A RAG pipeline issue affecting question answering or summarization quality
- A UI/UX inconsistency in the React frontend
- A documentation error in any `.md` file
- A refactor that improves code quality or maintainability

You must create a new issue and wait for it to be approved.

---

## 📌 Important Guidelines

✅ Open a new issue describing the problem clearly and wait for maintainer acknowledgment before submitting a Pull Request.  
✅ Submit a Pull Request with a clear and structured description.  
✅ Include your Team Number in the PR description.  
✅ Clearly explain the problem and the rationale behind your proposed change.  
✅ Attach screenshots if the change affects the React frontend UI.  

Maintainers reserve the right to close any PR that is:

- Trivial or low-effort
- Outside the intended scope
- Poorly documented
- Not aligned with repository standards

Please ensure that your contribution is meaningful, well-tested, and professionally presented.

---

## 🔐 Environment Variables & Secrets

This project uses environment variables for model configuration.

🚨 Do NOT share API keys or secrets in issues or pull requests.  
🚨 Do NOT commit your `.env` file to the repository.  
🚨 Never hardcode secrets directly in `server.js` or any Python file.  

If you need environment variable details to work on an assigned issue, please contact the organizers privately:

📱 WhatsApp: +91-8320699419 || +91-8347036131 || +91-9227448882  
📧 Email: charmidodiya2005@gmail.com || jadejakrishnapal04@gmail.com || aaleya2604@gmail.com  

Environment details will be shared only after the issue is officially assigned to you.

---

## 🛠 Tech Stack

This project uses:

- **Frontend:** React.js (`frontend/`)
- **Backend API:** Node.js + Express (`server.js`) running on port `4000`
- **RAG Service:** FastAPI + Hugging Face + FAISS (`rag-service/`) running on port `5000`
- **Embeddings:** Sentence Transformers via Hugging Face
- **Vector Store:** FAISS (in-memory)
- **LLM:** Hugging Face model (default: `google/flan-t5-base`)
- **PDF Processing:** LangChain / PyMuPDF (inside `rag-service/`)
- **Environment:** `.env` file in repo root for model configuration

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ (LTS recommended)
- Python 3.10+
- pip
- Git
- A code editor (VS Code recommended)

---

## 🚀 Getting Started

### Step 1: Fork the Repository

Navigate to [https://github.com/gdg-charusat/pdf-qa-bot](https://github.com/gdg-charusat/pdf-qa-bot)  
Click the **Fork** button in the top-right corner.  
This creates a copy of the repository in your GitHub account.

### Step 2: Clone Your Fork

Clone the forked repository to your local machine:
```bash
git clone https://github.com/YOUR-USERNAME/pdf-qa-bot.git
cd pdf-qa-bot
```

Replace `YOUR-USERNAME` with your GitHub username.

### Step 3: Add Upstream Remote

Add the original repository as an upstream remote to keep your fork synced:
```bash
git remote add upstream https://github.com/gdg-charusat/pdf-qa-bot.git
```

Verify the remotes:
```bash
git remote -v
```

You should see:

- `origin` - your fork ([https://github.com/YOUR-USERNAME/pdf-qa-bot.git](https://github.com/YOUR-USERNAME/pdf-qa-bot.git))
- `upstream` - the original repository ([https://github.com/gdg-charusat/pdf-qa-bot.git](https://github.com/gdg-charusat/pdf-qa-bot.git))

### Step 4: Install All Dependencies

From the repository root, install all three services in one go:
```bash
npm install
cd frontend && npm install
cd ../rag-service && python -m pip install -r requirements.txt
```

### Step 5: Set Up Environment Variables

Create a `.env` file in the repo root (or edit the existing one):
```
HF_GENERATION_MODEL=google/flan-t5-base
```

> **Note:** `OPENAI_API_KEY` is not required — this project uses the Hugging Face RAG flow.  
> Keep real secrets out of git at all times.

### Step 6: Run All Three Services

This app requires three terminals running simultaneously.

**Terminal A — RAG Service (port 5000):**
```bash
cd rag-service
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

**Terminal B — Node Backend (port 4000):**
```bash
node server.js
```

**Terminal C — React Frontend (port 3000):**
```bash
cd frontend
npm start
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.  
If the app loads and you can upload a PDF, your setup is complete.

### Step 7: Verify the Full Flow

- Upload a PDF using the frontend
- Ask a question about the PDF content
- Request a summary
- Confirm all three services respond correctly with no errors in any terminal

### Step 8: Create a New Branch

> **IMPORTANT:** Always create a new branch for your work. Never work directly on the `main` branch.
```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout -b feature/your-feature-name
```

**Branch Naming Convention:**

- `feature/` — for new features (e.g., `feature/multi-pdf-support`)
- `fix/` — for bug fixes (e.g., `fix/upload-connection-error`)
- `docs/` — for documentation (e.g., `docs/update-setup-guide`)
- `style/` — for UI changes (e.g., `style/frontend-layout`)
- `refactor/` — for code improvements (e.g., `refactor/rag-chunking-logic`)
- `test/` — for adding tests (e.g., `test/api-endpoint-tests`)

---

## 💻 Development Workflow

### 1. Pick an Issue

Browse the Issues page at [https://github.com/gdg-charusat/pdf-qa-bot/issues](https://github.com/gdg-charusat/pdf-qa-bot/issues)

Look for issues labelled:
- `good first issue` or `level: beginner` — for beginners
- `level: intermediate` — for intermediate contributors
- `level: advanced` — for advanced contributors

Comment on the issue with your request and team number, e.g.:
> "Hi, I'd like to work on this issue. - Team 07"

Wait to be officially assigned — do not start writing any code until a maintainer assigns you.  
Do not work on an issue already assigned to someone else.

### 2. Understand the Project Structure

Before writing any code, understand what each part does:

- `frontend/` — React UI for uploading PDFs, asking questions, and viewing summaries
- `server.js` — Node + Express API gateway running on port `4000`, forwards requests to FastAPI
- `rag-service/` — FastAPI service on port `5000` handling PDF processing, FAISS indexing, Q&A, and summarization
- `uploads/` — Runtime folder where uploaded PDFs are stored temporarily
- `.env` — Environment variables for model configuration

Understand the request flow before making changes:

1. Frontend uploads file to Node backend (`/upload`)
2. Node forwards file path to FastAPI (`/process-pdf`)
3. FastAPI loads and splits the PDF, builds FAISS vector index with embeddings
4. For `/ask` and `/summarize`, FastAPI retrieves relevant chunks and generates output with a Hugging Face model

### 3. Make Your Changes

- Write clean, readable code following the conventions of each service
- For `frontend/` — follow React functional component conventions
- For `server.js` — follow Express middleware and route conventions
- For `rag-service/` — follow FastAPI and Python PEP 8 conventions
- Do not change unrelated files — keep your PR focused on one issue only
- Test your changes across all three services before submitting

### 4. Test Your Changes

Start all three services and test the full flow:

**Terminal A:**
```bash
cd rag-service
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

**Terminal B:**
```bash
node server.js
```

**Terminal C:**
```bash
cd frontend
npm start
```

Verify these scenarios work correctly:

- PDF uploads successfully with no terminal errors
- A question about the PDF returns a relevant answer
- Summarize returns a coherent summary
- No port conflict or connection refused errors across terminals

You can also test the FastAPI endpoints directly via interactive docs at:  
[http://localhost:5000/docs](http://localhost:5000/docs)

### 5. Commit Your Changes

Write clear, descriptive commit messages:
```bash
git add .
git commit -m "fix: resolve connection refused error between Node and FastAPI"
```

**Commit Message Format:**

- `feat:` — new feature (e.g., `feat: add multi-PDF upload support`)
- `fix:` — bug fix (e.g., `fix: correct port mismatch in frontend config`)
- `docs:` — documentation changes (e.g., `docs: update API endpoint reference`)
- `style:` — UI or formatting changes (e.g., `style: improve upload button design`)
- `refactor:` — code restructuring (e.g., `refactor: simplify FAISS retrieval logic`)
- `test:` — adding or updating tests (e.g., `test: add upload endpoint tests`)
- `chore:` — maintenance tasks (e.g., `chore: update requirements.txt`)

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to your fork on GitHub: `https://github.com/YOUR-USERNAME/pdf-qa-bot`  
Click **"Compare & pull request"** button.  
Fill out the PR completely:

- **Title:** Clear, descriptive title (e.g., `Fix upload connection error between Node and FastAPI`)
- **Team Number:** You must state your team number (e.g., Team 07) — PRs without this will be closed
- **Issue Reference:** Link the assigned issue (e.g., `Closes #8`)
- **Description:** Explain what you changed and why, mentioning which service(s) were affected
- **Screenshots:** Add before/after screenshots if frontend UI changes are involved

Click **"Create pull request"**

---

## 📌 Issue Guidelines

### Finding Issues

Issues are categorised by difficulty level.

**🟢 Beginner Level (Good First Issues)**

- Fixing typos in variable names or API endpoint strings
- Updating documentation or README
- Adding missing error messages in the frontend
- Fixing minor UI inconsistencies in `frontend/`
- Correcting environment variable names

Labels: `good first issue`, `level: beginner`

**🟡 Intermediate Level**

- Fixing connection or port configuration issues between services
- Improving error handling in `server.js` or `rag-service/`
- Fixing PDF chunking or embedding logic in `rag-service/`
- Adding loading states or better user feedback in `frontend/`
- Improving the Q&A or summarization prompt quality

Labels: `level: intermediate`

**🔴 Advanced Level**

- Fixing complex RAG pipeline bugs affecting retrieval accuracy
- Implementing persistent FAISS index storage across restarts
- Multi-PDF support across the full stack
- Performance improvements to embedding or retrieval logic

Labels: `level: advanced`

---

### How to Request an Issue

Find an unassigned issue you want to work on.  
Comment on the issue with this format:

> "I'd like to work on this. - Team [your team number]"

Wait for a maintainer to assign it to you — this is mandatory.  
Once assigned, start working and submit your PR within 3–5 days.  
If you can't complete it in time, comment to let maintainers know.

⚠️ Before opening a new issue, ensure:

- The issue does not already exist
- It is clearly documented with which service it affects
- It aligns with the project scope (PDF upload, RAG pipeline, Q&A, summarization, frontend UI)

---

### Creating a New Issue

When creating a new issue:

- Use a clear and descriptive title (e.g., `Bug: Frontend cannot connect to Node backend on port 4000`)
- Add a detailed description covering:
  - Which service is affected (`frontend/`, `server.js`, or `rag-service/`)
  - What the bug causes (crash, wrong output, connection error)
  - Steps to reproduce
  - Expected vs actual behaviour
  - Terminal error messages or screenshots if applicable
- Wait for maintainer review before starting work

---

## 🔄 Pull Request Process

### PR Requirements — Non-Negotiable

PRs that don't meet **ALL** of the following will be closed without review:

- [ ] Team number stated in the PR description (e.g., Team XX)
- [ ] Linked to your assigned issue via `Closes #issue-number`
- [ ] You are the assigned contributor for that issue
- [ ] PR is raised after assignment, not before

### Before Submitting

- [ ] All three services start without errors in their respective terminals
- [ ] PDF upload works end to end from the frontend
- [ ] Questions return relevant answers from the PDF content
- [ ] Summarize returns a coherent summary
- [ ] No secrets or `.env` file committed
- [ ] Commit messages follow the conventional format above
- [ ] Before/after screenshots included if frontend UI was changed

### PR Review Process

A maintainer will review your PR within 24–48 hours.  
You may be asked to make changes — respond promptly.  
Make requested changes and push to the same branch (PR auto-updates).  
Only maintainers can approve and merge — do not request peers to merge.

### Addressing Review Comments

Make the requested changes, then:
```bash
git add .
git commit -m "fix: address review comments on RAG chunking logic"
git push origin feature/your-feature-name
```

---

## 🆘 Need Help?

- **Issue Discussion:** Comment on the issue you are working on
- **WhatsApp:** +91-8320699419 || +91-8347036131 || +91-9227448882
- **Email:** charmidodiya2005@gmail.com || jadejakrishnapal04@gmail.com || aaleya2604@gmail.com
- **FastAPI Interactive Docs:** [http://localhost:5000/docs](http://localhost:5000/docs)
- **Node API:** [http://localhost:4000](http://localhost:4000)
- **FastAPI Docs:** [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Hugging Face Docs:** [https://huggingface.co/docs](https://huggingface.co/docs)
- **FAISS Docs:** [https://faiss.ai](https://faiss.ai)

---

## 🎯 Tips for Success

**Run All Three Services First:** Before changing anything, start all three terminals and confirm each service is running on its correct port. Most issues come from one service not being up.

**Check the Port Numbers:** The frontend expects Node on port `4000`. Node expects FastAPI on port `5000`. If any port is wrong or already in use, the whole flow breaks.

**Use the FastAPI Docs:** Visit [http://localhost:5000/docs](http://localhost:5000/docs) to test the RAG service endpoints directly without needing the frontend. This isolates whether a bug is in the frontend, Node, or FastAPI.

**First Request is Slow:** The Hugging Face model downloads on first run. This is normal — wait for it before assuming something is broken.

**RAG Index Resets on Restart:** The FAISS index is in-memory. You must re-upload your PDF every time you restart the RAG service.

**Check Variable Names Carefully:** The most common bugs come from a variable name in `.env` not matching what `server.js` or `rag-service/main.py` reads. Compare them character by character.

**Ask Questions:** It is better to ask than to waste time going in the wrong direction. Comment on your assigned issue and maintainers will help.

**Be Patient:** Code review takes time — be responsive to feedback when it comes.

**Have Fun:** This is a full-stack RAG system. Debugging across three services simultaneously is a great learning experience. Enjoy it!

---

## 📜 Code of Conduct

Please be respectful and professional in all interactions. We are here to learn and help each other grow. Discrimination, harassment, or disrespectful behaviour of any kind will not be tolerated.

Happy Coding! 🚀

If you have any questions or need clarification, feel free to reach out to the maintainers or ask in the issue comments.

Thank you for contributing to PDF Q&A Bot!
