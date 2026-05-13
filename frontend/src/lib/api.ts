const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

function getErrorMessage(data: any) {
  if (!data) return "Something went wrong";

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: any) => {
        const field = item.loc?.join(".");
        return `${field}: ${item.msg}`;
      })
      .join(", ");
  }

  if (typeof data.detail === "object") {
    return JSON.stringify(data.detail);
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return JSON.stringify(data);
}

async function handleResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

/* ---------------- PROJECTS API ---------------- */

export type Project = {
  id: number;
  name: string;
  description?: string | null;
  owner_id: number;
  created_at: string;
};

export async function getProjects() {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response) as Promise<Project[]>;
}

export async function createProject(payload: {
  name: string;
  description?: string;
}) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/projects/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response) as Promise<Project>;
}

export async function deleteProject(projectId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}


/* ---------------- DATASETS API ---------------- */

export type Dataset = {
  id: number;
  project_id: number;
  input_text: string;
  expected_output?: string | null;
  category?: string | null;
  difficulty?: string | null;
  created_at: string;
};

export async function getDatasetsByProject(projectId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/datasets/project/${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response) as Promise<Dataset[]>;
}

export async function createDataset(payload: {
  project_id: number;
  input_text: string;
  expected_output?: string;
  category?: string;
  difficulty?: string;
}) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/datasets/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response) as Promise<Dataset>;
}

export async function deleteDataset(datasetId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

/* ---------------- PROMPTS API ---------------- */

export type Prompt = {
  id: number;
  project_id: number;
  name: string;
  system_prompt?: string | null;
  user_prompt: string;
  model_name?: string | null;
  temperature?: number | null;
  version?: string | null;
  created_at: string;
};

export async function getPromptsByProject(projectId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/prompts/project/${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response) as Promise<Prompt[]>;
}

export async function createPrompt(payload: {
  project_id: number;
  name: string;
  system_prompt?: string;
  user_prompt: string;
  model_name?: string;
  temperature?: number;
  version?: string;
}) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/prompts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response) as Promise<Prompt>;
}

export async function deletePrompt(promptId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/prompts/${promptId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

/* ---------------- EVALUATIONS API ---------------- */

export type Evaluation = {
  id: number;
  project_id: number;
  dataset_id: number;
  prompt_id: number;
  input_text: string;
  expected_output?: string | null;
  generated_output?: string | null;
  model_name?: string | null;
  score?: number | null;
  latency_ms?: number | null;
  status?: string | null;
  notes?: string | null;
  created_at: string;
};

export async function runEvaluation(payload: {
  project_id: number;
  dataset_id: number;
  prompt_id: number;
}) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/evaluations/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response) as Promise<Evaluation>;
}

export async function getEvaluationsByProject(projectId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/evaluations/project/${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response) as Promise<Evaluation[]>;
}

export async function deleteEvaluation(evaluationId: number) {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/evaluations/${evaluationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

/* ---------------- REPORTS API ---------------- */

export type ReportSummary = {
  projects: number;
  datasets: number;
  prompts: number;
  evaluations: number;
  average_score: number;
  average_latency_ms: number;
};

export async function getReportSummary() {
  const token = localStorage.getItem("trustops_token");

  const response = await fetch(`${API_BASE_URL}/reports/summary`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response) as Promise<ReportSummary>;
}


export type DashboardReport = {
  projects_count: number;
  datasets_count: number;
  prompts_count: number;
  evaluations_count: number;
  average_score: number;
  average_latency: number;
};

export async function getDashboardReport(): Promise<DashboardReport> {
  const token = localStorage.getItem("trustops_token");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  const url = `${cleanBaseUrl}/reports/summary`;

  console.log("Reports API URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to load dashboard report. Status: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        errorMessage += ` - ${errorData.detail}`;
      }
    } catch {
      // ignore JSON parse error
    }

    throw new Error(errorMessage);
  }

  return response.json();
}