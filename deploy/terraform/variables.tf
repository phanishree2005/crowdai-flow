variable "aws_region" {
  description = "The AWS region to deploy into"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "crowdflow-eks-prod"
}
