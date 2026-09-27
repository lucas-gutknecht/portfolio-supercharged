export const REPO_URL = 'https://github.com/lucas-gutknecht/portfolio-supercharged';

export const profile = {
  name: 'Lucas Gutknecht',
  email: 'lucas.gutknecht@gmail.com',
  github: 'https://github.com/lucas-gutknecht',
  location: 'Des Moines, Iowa',
  resume: '/files/resume.pdf',
  headshot: '/images/headshot.jpg',
  roles: ['Senior Software Engineer', 'Full Stack Developer', 'Data Engineer', 'AWS and Azure Cloud Builder', 'API Developer'],
  tagline:
    'I build reliable data pipelines, APIs and the Angular front ends that use them, on AWS and Azure and defined as code.',
  bio: [
    "My career started in reporting and grew into database administration before I moved into data engineering. I started out building ETL in SSIS and T-SQL. Today I build cloud-native systems in Python on AWS.",
    'Along the way I focused on event-driven architecture, API development and infrastructure as code with AWS CDK, and I worked closely with data science teams, putting their models into production ingestion pipelines. At MidAmerican Energy I led a migration from a legacy vendor platform to Azure Data Factory and Databricks.',
    'Today I work as a full stack developer, building Angular front ends and the backend APIs behind them in a MEAN stack environment. I like building systems that are resilient, observable and easy for the next engineer to understand.',
  ],
};

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 10, suffix: '+', label: 'Years working with data' },
  { value: 7, suffix: '+', label: 'Years in data engineering' },
  { value: 6, suffix: '+', label: 'Years building on AWS' },
  { value: 2, suffix: '', label: 'Industry certifications' },
];

/** Palette tokens from styles.scss, used to color-code focus areas, toolbox groups and tags. */
export type Accent = 'cyan' | 'violet' | 'pink' | 'green' | 'amber' | 'blue';

export interface Focus {
  icon: 'pipeline' | 'cloud' | 'bolt' | 'code';
  accent: Accent;
  title: string;
  text: string;
}

export const focusAreas: Focus[] = [
  {
    icon: 'pipeline',
    accent: 'cyan',
    title: 'Data pipelines',
    text: 'ETL and ELT in Python, PySpark and SQL: from Glue jobs writing Parquet queried in Athena to Kimball star schemas in the warehouse.',
  },
  {
    icon: 'bolt',
    accent: 'amber',
    title: 'Event-driven systems',
    text: 'Kafka, SNS and SQS feeding containerized workers on Fargate and ECS, with results exposed through API Gateway.',
  },
  {
    icon: 'cloud',
    accent: 'violet',
    title: 'Cloud and IaC',
    text: 'AWS CDK stacks, Azure Data Factory and Databricks, CI/CD in GitLab, GitHub and Azure DevOps, and least-privilege IAM.',
  },
  {
    icon: 'code',
    accent: 'pink',
    title: 'Full stack web apps',
    text: 'Angular front ends backed by REST APIs I build myself, including upgrading legacy apps from Angular 12 to Angular 20.',
  },
];

export interface Skill {
  name: string;
  detail: string;
  years: number;
}

/** Proficiency bars are scaled against the longest-held skill. */
export const skills: Skill[] = [
  { name: 'SQL', detail: 'T-SQL · PostgreSQL · MariaDB', years: 10 },
  { name: 'AWS', detail: 'Glue · Lambda · ECS · Step Functions', years: 6 },
  { name: 'Python', detail: 'Boto3 · pandas · APIs', years: 5 },
  { name: 'Event-driven', detail: 'Kafka · SQS · SNS', years: 3 },
  { name: 'PySpark', detail: 'AWS Glue · EMR · Databricks', years: 2 },
  { name: 'Azure', detail: 'Data Factory · Databricks · Storage', years: 1 },
  { name: 'Angular', detail: 'Front end · TypeScript · REST APIs', years: 1 },
  { name: 'Data science', detail: 'Linear / logistic regression', years: 2 },
];

export const toolbox: { group: string; accent: Accent; items: string[] }[] = [
  { group: 'Languages', accent: 'violet', items: ['SQL', 'Python', 'TypeScript', 'C#', 'VBA'] },
  {
    group: 'AWS',
    accent: 'amber',
    items: ['Glue', 'Lambda', 'API Gateway', 'Step Functions', 'SNS', 'SQS', 'ECS', 'ECR', 'EC2', 'IAM', 'S3', 'Athena', 'RDS', 'CloudFront'],
  },
  { group: 'Azure', accent: 'blue', items: ['Databricks', 'Data Factory', 'Storage Containers', 'Azure DevOps'] },
  { group: 'Data', accent: 'cyan', items: ['Kafka', 'Airflow', 'SSIS', 'CRON', 'CloudWatch Alarms', 'Kimball modeling', 'Parquet', 'EMR'] },
  { group: 'Web', accent: 'pink', items: ['Angular', 'TypeScript', 'REST APIs', 'MEAN stack'] },
  { group: 'Delivery', accent: 'green', items: ['AWS CDK', 'Docker', 'GitLab CI', 'GitHub', 'Azure DevOps'] },
];

/** Job tags that aren't toolbox items but belong to a toolbox group. */
const tagGroups: Record<string, string> = {
  Azure: 'Azure',
  Fargate: 'AWS',
  RDS: 'AWS',
  DMS: 'AWS',
  CDK: 'Delivery',
  PySpark: 'Data',
  'Data warehouse': 'Data',
  Oracle: 'Data',
  'SQL Server': 'Data',
  Boto3: 'Languages',
};

/** Accent for each job tag, matching the toolbox group it belongs to (first group wins). */
export const tagAccents = new Map<string, Accent>();
for (const { accent, items } of toolbox) {
  for (const item of items) if (!tagAccents.has(item)) tagAccents.set(item, accent);
}
for (const [tag, group] of Object.entries(tagGroups)) {
  tagAccents.set(tag, toolbox.find((g) => g.group === group)!.accent);
}

export interface Job {
  company: string;
  title: string;
  start: string;
  end: string;
  highlights: string[];
  tags: string[];
  /** Toolbox skills this role used, from the resume. Drives the skill filter along with tags. */
  uses: string[];
}

export const experience: Job[] = [
  {
    company: 'Wellmark',
    title: 'Senior Software Engineer',
    start: 'Mar 2026',
    end: 'Present',
    highlights: [
      'Upgraded a legacy Angular application from Angular 12 to Angular 20, working through breaking changes, updating dependencies and build tooling, and refactoring deprecated APIs.',
      'Work with business stakeholders to turn requirements into front-end features, UI improvements and REST API integrations.',
      'Build backend API endpoints and the front-end features that consume and display their data.',
    ],
    tags: ['Angular', 'TypeScript', 'REST APIs', 'MEAN stack'],
    uses: ['Angular', 'TypeScript', 'REST APIs', 'MEAN stack'],
  },
  {
    company: 'MidAmerican Energy',
    title: 'Data Engineer',
    start: 'Jun 2025',
    end: 'Mar 2026',
    highlights: [
      'Led a small team migrating off Celonis, a legacy ETL and reporting tool, to Azure Data Factory and Databricks, and designed the target architecture.',
      'Built Data Factory templates and pipelines that pass parameters to Databricks notebooks to automate incremental and full loads.',
      'Wrote Databricks notebooks that connect directly to source systems and transform data with PySpark.',
    ],
    tags: ['Azure', 'Data Factory', 'Databricks', 'PySpark'],
    uses: ['Databricks', 'Data Factory', 'Python'],
  },
  {
    company: 'Corteva',
    title: 'Data Engineer',
    start: 'May 2022',
    end: 'Jun 2025',
    highlights: [
      'Built a business application that consumes Kafka events, runs Python in Docker images on AWS Fargate, writes to RDS and exposes the data through API Gateway.',
      'Put data science models (pickle format) into production in an ingestion pipeline deployed on ECS.',
      'Sped up a Glue job by multi-threading its API calls.',
      'Designed star-schema data models following Kimball best practices, and ran T-SQL ETL orchestrated by Airflow.',
      'Manage application roles in IAM with least privilege.',
    ],
    tags: ['Kafka', 'Fargate', 'ECS', 'Glue', 'Airflow', 'API Gateway'],
    uses: ['SQL', 'Python', 'Kafka', 'Docker', 'RDS', 'API Gateway', 'ECS', 'Glue', 'Airflow', 'SNS', 'S3', 'Lambda', 'IAM', 'Kimball modeling'],
  },
  {
    company: 'Principal Financial Group',
    title: 'Data Engineer',
    start: 'Jan 2021',
    end: 'May 2022',
    highlights: [
      'Built and maintained AWS applications on Lambda, Glue, SNS, SQS, CloudWatch, VPC and S3.',
      'Wrote PySpark Glue jobs that transform data into Parquet for querying in Athena.',
      'Deployed resources through CDK as infrastructure as code.',
    ],
    tags: ['PySpark', 'Lambda', 'Athena', 'CDK'],
    uses: ['SQL', 'Python', 'Lambda', 'Glue', 'SNS', 'SQS', 'CloudWatch Alarms', 'S3', 'Athena', 'Parquet', 'AWS CDK'],
  },
  {
    company: 'CDS Global',
    title: 'Data Engineer',
    start: 'Mar 2020',
    end: 'Jan 2021',
    highlights: [
      'Moved SSIS workloads to AWS (S3, RDS, AWS CLI).',
      'Built PySpark jobs on EMR and Python integrations using Boto3 and client APIs.',
    ],
    tags: ['EMR', 'Boto3', 'RDS'],
    uses: ['SQL', 'Python', 'SSIS', 'S3', 'RDS', 'EMR'],
  },
  {
    company: 'Hy-Vee',
    title: 'Data Engineer',
    start: 'Sep 2019',
    end: 'Mar 2020',
    highlights: [
      'Built ETL with T-SQL stored procedures and SSIS packages, plus Python vendor integrations over APIs and SFTP.',
      'Built C# .NET Windows Forms tools for data maintenance.',
    ],
    tags: ['SSIS', 'Python', 'C#'],
    uses: ['SQL', 'Python', 'C#', 'SSIS'],
  },
  {
    company: "Casey's",
    title: 'Data Engineer',
    start: 'Jan 2019',
    end: 'Sep 2019',
    highlights: [
      'Loaded the Microsoft APS data warehouse with SSIS, including Kimball slowly changing dimensions.',
    ],
    tags: ['SSIS', 'Data warehouse'],
    uses: ['SQL', 'SSIS', 'Kimball modeling'],
  },
  {
    company: 'CDS Global',
    title: 'Database Administrator',
    start: 'May 2018',
    end: 'Jan 2019',
    highlights: [
      'Migrated SQL Server to AWS RDS with the Schema Conversion Tool and DMS, and set up a 3-node EC2 cluster.',
    ],
    tags: ['RDS', 'DMS', 'EC2', 'Linux'],
    uses: ['SQL', 'RDS', 'EC2', 'CRON'],
  },
  {
    company: 'Athene',
    title: 'Product Analyst',
    start: 'May 2016',
    end: 'May 2018',
    highlights: ['Automated rate and annuity tooling with SQL against Oracle and VBA.'],
    tags: ['Oracle', 'VBA'],
    uses: ['SQL', 'VBA'],
  },
  {
    company: 'Voya Financial · Sentinel Development',
    title: 'Business Analyst · SQL Developer',
    start: 'Mar 2015',
    end: 'May 2016',
    highlights: ['Migrated Access to SQL Server, built reporting, and scrubbed and mapped client data imports.'],
    tags: ['SQL Server', 'Access'],
    uses: ['SQL'],
  },
];

export const education = [
  { title: 'Microsoft Azure Data Fundamentals', org: 'Microsoft certification', year: '2025' },
  { title: 'Microsoft Azure Fundamentals', org: 'Microsoft certification', year: '2025' },
  { title: 'Data Science Certification', org: 'Des Moines Area Community College', year: '2024' },
  { title: 'Python Application Developer Certification', org: 'Des Moines Area Community College', year: '2022' },
  { title: 'Database Management Specialist', org: 'Des Moines Area Community College', year: '2015' },
  { title: 'B.S. Business Administration, Marketing', org: 'Drake University', year: '2009' },
];

export interface PipelineStep {
  name: string;
  role: string;
  detail: string;
}

export interface Pipeline {
  id: string;
  label: string;
  company: string;
  summary: string;
  accent: Accent;
  steps: PipelineStep[];
}

/** Systems from the experience section, drawn as animated data-flow diagrams. */
export const pipelines: Pipeline[] = [
  {
    id: 'corteva',
    label: 'Event-driven API',
    company: 'Corteva · AWS',
    summary: 'Business events stream in from Kafka, are processed by containerized Python, and are served through an API.',
    accent: 'amber',
    steps: [
      { name: 'Kafka', role: 'Event stream', detail: 'Business events arrive as messages from Kafka event messaging services.' },
      {
        name: 'Fargate',
        role: 'Python in Docker',
        detail: 'Python scripts packaged as Docker images run on AWS Fargate and process each message.',
      },
      { name: 'RDS', role: 'Relational store', detail: 'Processed records are written to an Amazon RDS database.' },
      { name: 'API Gateway', role: 'REST API', detail: 'The data is exposed to consumers through API Gateway.' },
    ],
  },
  {
    id: 'midamerican',
    label: 'Celonis → Azure migration',
    company: 'MidAmerican Energy · Azure',
    summary: 'A legacy ETL and reporting platform replaced with parameterized Data Factory pipelines and Databricks notebooks.',
    accent: 'blue',
    steps: [
      {
        name: 'Data Factory',
        role: 'Orchestration',
        detail: 'Reusable Data Factory templates schedule each job and pass parameters, such as incremental or full load, to Databricks.',
      },
      {
        name: 'Source systems',
        role: 'Direct connection',
        detail: 'Databricks notebooks connect directly to the source data and load it into a DataFrame.',
      },
      { name: 'Databricks', role: 'PySpark transforms', detail: 'Notebooks transform the data with PySpark.' },
      { name: 'Azure Storage', role: 'Landing zone', detail: 'Transformed data is written to Azure Storage containers.' },
    ],
  },
];

/** Extra search terms for toolbox items whose name doesn't appear verbatim in the experience text. */
export const skillTerms: Record<string, string[]> = {
  'REST APIs': ['REST API'],
  'Kimball modeling': ['Kimball'],
  'GitLab CI': ['GitLab'],
  'AWS CDK': ['CDK'],
  'CloudWatch Alarms': ['CloudWatch'],
  'Storage Containers': ['Azure Storage'],
};
