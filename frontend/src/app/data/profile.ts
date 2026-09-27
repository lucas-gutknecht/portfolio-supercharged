export const REPO_URL = 'https://github.com/lucas-gutknecht/portfolio-supercharged';

export const profile = {
  name: 'Lucas Gutknecht',
  email: 'lucas.gutknecht@gmail.com',
  github: 'https://github.com/lucas-gutknecht',
  location: 'Des Moines, Iowa',
  resume: '/files/resume.pdf',
  headshot: '/images/headshot.jpg',
  roles: ['Data Engineer', 'AWS Cloud Builder', 'Pipeline Architect', 'API Developer'],
  tagline:
    'I turn messy, fast-moving data into reliable pipelines, event-driven systems and APIs, built on AWS and defined as code.',
  bio: [
    "My career started in reporting and grew into database administration before I moved into data engineering. I started out building ETL in SSIS and T-SQL. Today I build cloud-native systems in Python on AWS.",
    'Recently I have focused on event-driven architecture, API development and infrastructure as code with AWS CDK. I have also worked closely with data science teams, putting their models into production ingestion pipelines. I like building data platforms that are resilient, observable and easy for the next engineer to understand.',
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

export interface Focus {
  icon: 'pipeline' | 'cloud' | 'bolt';
  title: string;
  text: string;
}

export const focusAreas: Focus[] = [
  {
    icon: 'pipeline',
    title: 'Data pipelines',
    text: 'ETL and ELT in Python, PySpark and SQL: from Glue jobs writing Parquet queried in Athena to Kimball star schemas in the warehouse.',
  },
  {
    icon: 'bolt',
    title: 'Event-driven systems',
    text: 'Kafka, SNS and SQS feeding containerized workers on Fargate and ECS, with results exposed through API Gateway.',
  },
  {
    icon: 'cloud',
    title: 'Cloud and IaC',
    text: 'AWS CDK stacks, CI/CD in GitLab and GitHub, and least-privilege IAM, so infrastructure is reviewable and repeatable.',
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
  { name: 'PySpark', detail: 'AWS Glue · EMR · Athena', years: 2 },
  { name: 'Data science', detail: 'Linear / logistic regression', years: 2 },
];

export const toolbox: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['SQL', 'Python', 'TypeScript', 'C#', 'VBA'] },
  {
    group: 'AWS',
    items: ['Glue', 'Lambda', 'API Gateway', 'Step Functions', 'SNS', 'SQS', 'ECS', 'ECR', 'EC2', 'IAM', 'S3', 'Athena', 'RDS', 'CloudFront'],
  },
  { group: 'Data', items: ['Kafka', 'Airflow', 'SSIS', 'Kimball modeling', 'Parquet', 'EMR'] },
  { group: 'Delivery', items: ['AWS CDK', 'Docker', 'GitLab CI', 'GitHub', 'Angular'] },
];

export interface Job {
  company: string;
  title: string;
  start: string;
  end: string;
  highlights: string[];
  tags: string[];
}

export const experience: Job[] = [
  {
    company: 'Corteva',
    title: 'Data Engineer',
    start: 'May 2022',
    end: 'Present',
    highlights: [
      'Built a business application that consumes Kafka events, runs Python in Docker images on AWS Fargate, writes to RDS and exposes the data through API Gateway.',
      'Put data science models (pickle format) into production in an ingestion pipeline deployed on ECS.',
      'Sped up a Glue job by multi-threading its API calls.',
      'Designed star-schema data models following Kimball best practices, and ran T-SQL ETL orchestrated by Airflow.',
      'Manage application roles in IAM with least privilege.',
    ],
    tags: ['Kafka', 'Fargate', 'ECS', 'Glue', 'Airflow', 'API Gateway'],
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
  },
  {
    company: 'Athene',
    title: 'Product Analyst',
    start: 'May 2016',
    end: 'May 2018',
    highlights: ['Automated rate and annuity tooling with SQL against Oracle and VBA.'],
    tags: ['Oracle', 'VBA'],
  },
  {
    company: 'Voya Financial · Sentinel Development',
    title: 'Business Analyst · SQL Developer',
    start: 'Mar 2015',
    end: 'May 2016',
    highlights: ['Migrated Access to SQL Server, built reporting, and scrubbed and mapped client data imports.'],
    tags: ['SQL Server', 'Access'],
  },
];

export const education = [
  { title: 'Data Science Certification', org: 'Des Moines Area Community College', year: '2024' },
  { title: 'Python Application Developer Certification', org: 'Des Moines Area Community College', year: '2022' },
  { title: 'Database Management Specialist', org: 'Des Moines Area Community College', year: '2015' },
  { title: 'B.S. Business Administration, Marketing', org: 'Drake University', year: '2009' },
];
