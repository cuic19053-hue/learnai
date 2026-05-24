/**
 * Canonical seed list of supported certifications and their official,
 * vendor-owned source URLs.
 *
 * This file is the *only* place we write certification metadata by
 * hand. The admin seed endpoint (`/api/admin/certifications/seed`)
 * upserts these rows into Postgres on demand; the JSON-pack ingester
 * adds questions on top.
 *
 * Every `sources[]` entry MUST pass `isAllowedOfficialSource()` in
 * `source-policy.ts`. Add new entries below and re-run the seed
 * endpoint to publish them.
 */

import type { CertificationLevel, CertificationStatus, CertificationVendor } from "@prisma/client";

export type OfficialSeedSource = {
  title: string;
  url: string;
  domain: string;
  /**
   * Free-form provenance label. Examples:
   *   - official_exam_guide
   *   - official_certification_page
   *   - official_retirement_notice
   *   - official_learning_path
   *   - official_docs_index
   */
  sourceType: string;
  isPrimary: boolean;
};

export type OfficialSeedEntry = {
  slug: string;
  code: string;
  title: string;
  vendor: CertificationVendor;
  level: CertificationLevel;
  status: CertificationStatus;
  officialUrl: string;
  officialDomain: string;
  shortDescription: string;
  /** Optional alias slug used by the JSON-pack ingester when the legacy
   *  filename slug differs from the modern slug. */
  legacySlugs?: string[];
  sources: OfficialSeedSource[];
};

export const OFFICIAL_CERTIFICATION_SEED: ReadonlyArray<OfficialSeedEntry> = [
  // ── AWS ────────────────────────────────────────────────────────────
  {
    slug: "aws-certified-cloud-practitioner",
    code: "CLF-C02",
    title: "AWS Certified Cloud Practitioner",
    vendor: "AWS",
    level: "FOUNDATIONAL",
    status: "ACTIVE",
    officialUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html",
    officialDomain: "docs.aws.amazon.com",
    shortDescription: "Validates overall AWS Cloud knowledge independent of a specific job role.",
    legacySlugs: ["CLF-C02-v1"],
    sources: [
      {
        title: "AWS Certified Cloud Practitioner Exam Guide (CLF-C02)",
        url: "https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html",
        domain: "docs.aws.amazon.com",
        sourceType: "official_exam_guide",
        isPrimary: true,
      },
      {
        title: "AWS Certified Cloud Practitioner — Overview",
        url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
        domain: "aws.amazon.com",
        sourceType: "official_certification_page",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "aws-certified-solutions-architect-associate",
    code: "SAA-C03",
    title: "AWS Certified Solutions Architect – Associate",
    vendor: "AWS",
    level: "ASSOCIATE",
    status: "ACTIVE",
    officialUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html",
    officialDomain: "docs.aws.amazon.com",
    shortDescription:
      "Validates designing resilient, performant, secure, and cost-optimized AWS solutions.",
    legacySlugs: ["SAA-C03-v1", "SAA-C03-v2"],
    sources: [
      {
        title: "AWS Certified Solutions Architect – Associate Exam Guide (SAA-C03)",
        url: "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html",
        domain: "docs.aws.amazon.com",
        sourceType: "official_exam_guide",
        isPrimary: true,
      },
      {
        title: "AWS Certified Solutions Architect – Associate — Overview",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        domain: "aws.amazon.com",
        sourceType: "official_certification_page",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "aws-certified-solutions-architect-professional",
    code: "SAP-C02",
    title: "AWS Certified Solutions Architect – Professional",
    vendor: "AWS",
    level: "PROFESSIONAL",
    status: "ACTIVE",
    officialUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html",
    officialDomain: "docs.aws.amazon.com",
    shortDescription:
      "Validates advanced AWS architecture across complex, multi-account, multi-Region workloads.",
    legacySlugs: ["SAP-C02-v1"],
    sources: [
      {
        title: "AWS Certified Solutions Architect – Professional Exam Guide (SAP-C02)",
        url: "https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html",
        domain: "docs.aws.amazon.com",
        sourceType: "official_exam_guide",
        isPrimary: true,
      },
      {
        title: "AWS Certified Solutions Architect – Professional — Overview",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-professional/",
        domain: "aws.amazon.com",
        sourceType: "official_certification_page",
        isPrimary: false,
      },
    ],
  },
  {
    slug: "aws-certified-devops-engineer-professional",
    code: "DOP-C02",
    title: "AWS Certified DevOps Engineer – Professional",
    vendor: "AWS",
    level: "PROFESSIONAL",
    status: "ACTIVE",
    officialUrl:
      "https://docs.aws.amazon.com/aws-certification/latest/devops-engineer-professional-02/devops-engineer-professional-02.html",
    officialDomain: "docs.aws.amazon.com",
    shortDescription:
      "Validates SDLC automation, configuration management, monitoring, and incident response on AWS.",
    legacySlugs: ["DOP-C02-v1"],
    sources: [
      {
        title: "AWS Certified DevOps Engineer – Professional Exam Guide (DOP-C02)",
        url: "https://docs.aws.amazon.com/aws-certification/latest/devops-engineer-professional-02/devops-engineer-professional-02.html",
        domain: "docs.aws.amazon.com",
        sourceType: "official_exam_guide",
        isPrimary: true,
      },
      {
        title: "AWS Certified DevOps Engineer – Professional — Overview",
        url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/",
        domain: "aws.amazon.com",
        sourceType: "official_certification_page",
        isPrimary: false,
      },
    ],
  },

  // ── Microsoft Azure ───────────────────────────────────────────────
  {
    slug: "microsoft-certified-azure-fundamentals",
    code: "AZ-900",
    title: "Microsoft Certified: Azure Fundamentals",
    vendor: "AZURE",
    level: "FUNDAMENTALS",
    status: "ACTIVE",
    officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
    officialDomain: "learn.microsoft.com",
    shortDescription:
      "Foundational Azure credential covering cloud concepts, core Azure services, and governance.",
    sources: [
      {
        title: "Microsoft Certified: Azure Fundamentals",
        url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        domain: "learn.microsoft.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },
  {
    slug: "microsoft-certified-azure-ai-fundamentals",
    code: "AI-900",
    title: "Microsoft Certified: Azure AI Fundamentals",
    vendor: "AZURE",
    level: "FUNDAMENTALS",
    status: "ACTIVE",
    officialUrl:
      "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
    officialDomain: "learn.microsoft.com",
    shortDescription:
      "Validates foundational understanding of AI/ML concepts and Azure AI services.",
    sources: [
      {
        title: "Microsoft Certified: Azure AI Fundamentals",
        url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        domain: "learn.microsoft.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },

  // ── Google Cloud ──────────────────────────────────────────────────
  {
    slug: "google-cloud-digital-leader",
    code: "Cloud Digital Leader",
    title: "Cloud Digital Leader",
    vendor: "GCP",
    level: "FOUNDATIONAL",
    status: "ACTIVE",
    officialUrl: "https://cloud.google.com/learn/certification/cloud-digital-leader",
    officialDomain: "cloud.google.com",
    shortDescription:
      "Validates cloud-fundamentals knowledge of Google Cloud products, services, and business use cases.",
    sources: [
      {
        title: "Cloud Digital Leader",
        url: "https://cloud.google.com/learn/certification/cloud-digital-leader",
        domain: "cloud.google.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },
  {
    slug: "google-cloud-associate-cloud-engineer",
    code: "ACE",
    title: "Google Cloud Associate Cloud Engineer",
    vendor: "GCP",
    level: "ASSOCIATE",
    status: "ACTIVE",
    officialUrl: "https://cloud.google.com/learn/certification/cloud-engineer",
    officialDomain: "cloud.google.com",
    shortDescription:
      "Validates the ability to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud.",
    legacySlugs: ["GCP-CA"],
    sources: [
      {
        title: "Associate Cloud Engineer",
        url: "https://cloud.google.com/learn/certification/cloud-engineer",
        domain: "cloud.google.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },
  {
    slug: "google-cloud-professional-ml-engineer",
    code: "PMLE",
    title: "Google Cloud Professional Machine Learning Engineer",
    vendor: "GCP",
    level: "PROFESSIONAL",
    status: "ACTIVE",
    officialUrl: "https://cloud.google.com/learn/certification/machine-learning-engineer",
    officialDomain: "cloud.google.com",
    shortDescription:
      "Validates designing, building, and productionizing ML models on Google Cloud.",
    legacySlugs: ["GCP-ML-vA", "GCP-ML-vB"],
    sources: [
      {
        title: "Professional Machine Learning Engineer",
        url: "https://cloud.google.com/learn/certification/machine-learning-engineer",
        domain: "cloud.google.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },

  // ── IBM ───────────────────────────────────────────────────────────
  {
    slug: "ibm-generative-ai-engineer-associate",
    code: "C1000-185",
    title: "IBM Certified Associate — Generative AI Engineer",
    vendor: "IBM",
    level: "ASSOCIATE",
    status: "ACTIVE",
    officialUrl:
      "https://www.ibm.com/training/certification/ibm-certified-associate-generative-ai-engineer-C1000-185",
    officialDomain: "www.ibm.com",
    shortDescription:
      "Validates fundamentals of generative AI, foundation models, prompt engineering, and IBM watsonx.",
    legacySlugs: ["C1000-185-v1"],
    sources: [
      {
        title: "IBM Certified Associate — Generative AI Engineer (C1000-185)",
        url: "https://www.ibm.com/training/certification/ibm-certified-associate-generative-ai-engineer-C1000-185",
        domain: "www.ibm.com",
        sourceType: "official_certification_page",
        isPrimary: true,
      },
    ],
  },
];

/**
 * Build a reverse index from a legacy JSON filename slug to its
 * modern entry. Used by the JSON-pack ingester to map old packs
 * onto the right Certification row.
 */
export function buildLegacySlugMap(): Map<string, OfficialSeedEntry> {
  const map = new Map<string, OfficialSeedEntry>();
  for (const entry of OFFICIAL_CERTIFICATION_SEED) {
    map.set(entry.slug, entry);
    for (const legacy of entry.legacySlugs ?? []) {
      map.set(legacy, entry);
    }
  }
  return map;
}
