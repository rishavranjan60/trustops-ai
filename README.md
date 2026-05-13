# TrustOps AI

TrustOps AI is a production-style AI evaluation and LLMOps platform built to test, monitor, and improve the reliability of AI-generated responses.

The project helps teams evaluate whether an LLM response is correct, relevant, fast, and trustworthy before using it in real production systems.

---

## Problem Statement

Many companies are integrating AI chatbots, LLM assistants, and RAG-based applications into their products. However, AI responses can sometimes be incorrect, incomplete, unsafe, slow, or inconsistent.

Without an evaluation system, teams cannot easily answer questions like:

- Is the generated answer correct?
- Does the answer match the expected output?
- Which prompt performs better?
- Which model is faster?
- Did the system use the real AI provider or fallback mode?
- What is the average quality score across evaluations?

TrustOps AI solves this problem by providing a dashboard to evaluate LLM outputs using datasets, prompts, scoring, latency tracking, and reporting.

---

## Key Features

- User authentication with JWT
- Project management
- Dataset management
- Prompt management
- LLM evaluation runs
- Gemini API integration
- Mock fallback when Gemini quota is exhausted
- Improved scoring system
- Score labels: Excellent, Good, Weak, Poor
- Latency tracking
- Evaluation history
- Dashboard analytics
- Reports page
- Docker Compose setup
- GitHub Actions CI/CD

---

## Real-Life Use Case

A company using an AI customer support chatbot can use TrustOps AI to test whether the chatbot gives correct answers before deploying it to users.



## Input
Explain Kubernetes in simple words.

## Expected Output 
Kubernetes is a platform for running and managing containers.

## Generated Output
Kubernetes helps you run and manage groups of applications that are packaged together in containers.

##### TrustOps AI compares the generated answer with the expected answer and calculates a score, latency, model name, and quality label.


## Tech Stack

### Frontend

 

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hooks
- Fetch API

### Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Pydantic
- JWT Authentication
- pwdlib with Argon2
- Gemini API

### AI / MLOps
- scikit-learn
- PyTorch
- MLflow
- Qdrant
- SHAP
- Evidently AI

### DevOps
- Docker
- Docker Compose
- GitHub Actions
- CI/CD pipelines

### he README should explain:

1. What TrustOps AI is
2. Real-life problem it solves
3. Features
4. Tech stack
5. Architecture
6. How to run locally
7. How to run with Docker
8. Demo flow
9. Future improvements


### Demo Flow

## Recommended demo flow:

- Register a new user
- Login
- Create a project
- Add a dataset item
- Add a prompt
- Run evaluation
- View score, latency, model, and generated output
- Open dashboard analytics
- Open reports page