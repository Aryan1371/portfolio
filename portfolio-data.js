/**
 * portfolio-data.js — Dynamic Portfolio Content Store
 * Provides default data, localStorage persistence, and live updates.
 */

'use strict';

const DEFAULT_PORTFOLIO_DATA = {
  profile: {
    name: "Alex Rivera",
    role: "Full-Stack Architect & AI Specialist",
    badge: "Available for freelance & consulting",
    statusText: "SYSTEM: ONLINE // READY TO DEPLOY",
    typedWords: [
      "Full-Stack Developer",
      "Cyberpunk UI Architect",
      "AI Systems Engineer",
      "High-Scale API Designer",
      "Open Source Pioneer"
    ],
    tagline: "I craft **high-performance, cyber-aesthetic, and scalable** digital experiences — bridging futuristic neural interfaces with bulletproof distributed backends.",
    heroStats: {
      projects: 50,
      experience: 5,
      clients: 30
    }
  },
  about: {
    avatarInitials: "AR",
    yearsBadge: "5+",
    intro: "I'm a passionate **Full-Stack Architect & Creative Technologist** based in San Francisco, CA, dedicated to building cutting-edge web applications and autonomous AI systems.",
    bio1: "With over 5 years of professional engineering experience, I've designed and scaled mission-critical cloud applications for high-growth startups and global enterprise platforms. I fuse *cyberpunk aesthetics with robust software engineering*, ensuring every product is visually arresting and mathematically performant.",
    bio2: "When I'm not in code flow, you'll find me experimenting with local LLMs, contributing to open-source developer tooling, or hiking coastal trails in California.",
    highlights: [
      { icon: "⚡", title: "Problem Solver", desc: "Complex challenges, elegant architectural solutions" },
      { icon: "🚀", title: "Performance-First", desc: "Sub-second latencies and 99.99% uptime" },
      { icon: "🎨", title: "Cyberpunk Aesthetics", desc: "Pixel-perfect futuristic UI/UX with micro-interactions" }
    ]
  },
  skills: [
    {
      category: "Frontend & UI",
      icon: "⚡",
      items: [
        { name: "React / Next.js", level: 96 },
        { name: "TypeScript", level: 94 },
        { name: "Three.js / Canvas 3D", level: 88 },
        { name: "CSS / Tailwind / Cyber-UI", level: 95 }
      ]
    },
    {
      category: "Backend & Systems",
      icon: "🔧",
      items: [
        { name: "Node.js / Express", level: 92 },
        { name: "Python / FastAPI", level: 88 },
        { name: "PostgreSQL / Redis", level: 86 },
        { name: "GraphQL & WebSockets", level: 84 }
      ]
    },
    {
      category: "DevOps & Cloud",
      icon: "🚀",
      items: [
        { name: "Docker / Kubernetes", level: 90 },
        { name: "AWS & Cloudflare Edge", level: 86 },
        { name: "CI/CD & GitOps", level: 88 },
        { name: "Terraform / IaC", level: 80 }
      ]
    },
    {
      category: "AI & Modern Tech",
      icon: "🧠",
      items: [
        { name: "LangChain / LLM APIs", level: 87 },
        { name: "Vector Databases (Pinecone)", level: 84 },
        { name: "Realtime Streaming", level: 91 },
        { name: "Web Security & Auth", level: 89 }
      ]
    }
  ],
  softSkills: [
    "System Design",
    "Technical Architecture",
    "Agile / Scrum",
    "Code Reviews",
    "Team Leadership",
    "Rapid Prototyping",
    "Autonomous Problem Solving",
    "Creative Direction"
  ],
  projects: [
    {
      id: "proj-quantum",
      number: "01",
      title: "Quantum Analytics",
      desc: "Real-time cyber telemetry and analytics dashboard with interactive data visualizations, multi-tenant SaaS architecture supporting 50K+ daily active events.",
      tags: ["React", "TypeScript", "D3.js", "Node.js"],
      image: "project1.jpg",
      demoLink: "#",
      codeLink: "#"
    },
    {
      id: "proj-avant",
      number: "02",
      title: "Avant Cyber-Commerce",
      desc: "High-performance headless e-commerce engine with sub-50ms catalog searches, Stripe payments, and a distributed Redis caching layer achieving 99/100 Lighthouse scores.",
      tags: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
      image: "project2.jpg",
      demoLink: "#",
      codeLink: "#"
    },
    {
      id: "proj-synapse",
      number: "03",
      title: "Synapse Neuro-Chat",
      desc: "Futuristic conversational AI interface featuring multi-modal context memory, streaming voice synthesis, and real-time bidirectional WebSocket sockets.",
      tags: ["Python", "FastAPI", "WebSocket", "OpenAI"],
      image: "project3.jpg",
      demoLink: "#",
      codeLink: "#"
    },
    {
      id: "proj-flowsync",
      number: "04",
      title: "FlowSync DevOps",
      desc: "Collaborative cloud infrastructure control room with drag-and-drop live topology maps, incident mitigation automations, and GitHub Actions telemetry.",
      tags: ["Vue.js", "Socket.io", "MongoDB", "Docker"],
      image: "project4.jpg",
      demoLink: "#",
      codeLink: "#"
    }
  ],
  contact: {
    email: "a1371rya@gmail.com",
    location: "San Francisco, CA / Remote Global",
    phone: "+1 (555) 789-CYBER",
    status: "Available for Q4 contracts & full-time roles"
  },
  social: {
    github: "https://github.com/Aryan1371",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  }
};

const STORAGE_KEY = 'portfolio_custom_data_v2';

const PortfolioStore = {
  get() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to guarantee all keys exist
        return {
          profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
          about: { ...DEFAULT_PORTFOLIO_DATA.about, ...(parsed.about || {}) },
          skills: parsed.skills && parsed.skills.length ? parsed.skills : DEFAULT_PORTFOLIO_DATA.skills,
          softSkills: parsed.softSkills && parsed.softSkills.length ? parsed.softSkills : DEFAULT_PORTFOLIO_DATA.softSkills,
          projects: parsed.projects && parsed.projects.length ? parsed.projects : DEFAULT_PORTFOLIO_DATA.projects,
          contact: { ...DEFAULT_PORTFOLIO_DATA.contact, ...(parsed.contact || {}) },
          social: { ...DEFAULT_PORTFOLIO_DATA.social, ...(parsed.social || {}) }
        };
      }
    } catch (e) {
      console.warn('Failed to load portfolio data from storage, using defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  },

  set(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('portfolioDataChanged', { detail: data }));
      return true;
    } catch (e) {
      console.error('Failed to save portfolio data to storage', e);
      return false;
    }
  },

  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const data = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      window.dispatchEvent(new CustomEvent('portfolioDataChanged', { detail: data }));
      return data;
    } catch (e) {
      console.error('Failed to reset portfolio data', e);
      return DEFAULT_PORTFOLIO_DATA;
    }
  },

  exportJSON() {
    const data = this.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && (parsed.profile || parsed.projects)) {
        this.set(parsed);
        return { success: true };
      }
      return { success: false, error: "Invalid portfolio data format" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

window.PortfolioStore = PortfolioStore;
window.DEFAULT_PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;
