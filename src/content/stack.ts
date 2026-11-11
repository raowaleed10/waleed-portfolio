import type { Stack } from "./types";

export const stack = {
  intro: "What I use in production.",
  groups: [
    { category: "Languages", items: ["Python", "TypeScript", "JavaScript", "SQL"] },
    {
      category: "Backend",
      items: [
        "Django",
        "Django REST Framework",
        "Django Channels",
        "Celery",
        "FastAPI",
        "REST API design",
      ],
    },
    {
      category: "Frontend",
      items: [
        "React",
        "Next.js",
        "TypeScript",
        "Redux Toolkit",
        "RTK Query",
        "ReactFlow",
        "Tailwind CSS",
        "Vite",
      ],
    },
    {
      category: "Data",
      items: [
        "PostgreSQL (indexing, query tuning, production-safe migrations)",
        "Redis",
        "pgvector",
      ],
    },
    {
      category: "AI / LLM",
      items: [
        "Anthropic Claude API",
        "OpenAI API",
        "LangChain",
        "RAG pipelines",
        "sentence-transformers",
      ],
    },
    {
      category: "Security & auth",
      items: [
        "OAuth2 / OIDC",
        "JWT with refresh-token rotation",
        "RBAC",
        "HMAC signature verification",
        "Fernet encryption",
      ],
    },
    {
      category: "Infrastructure & testing",
      items: [
        "Docker",
        "Nginx",
        "Gunicorn / Uvicorn (ASGI)",
        "GitHub Actions CI/CD",
        "AWS",
        "Linux",
        "Sentry",
        "pytest",
      ],
    },
    {
      category: "Integrations",
      items: ["Stripe", "Shopify Admin API", "Freshdesk", "Gorgias"],
    },
  ],
} as const satisfies Stack;
