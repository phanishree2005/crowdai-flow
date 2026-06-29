variable "cluster_name" {
  type        = string
  description = "The name of the EKS cluster"
  default     = "crowdflow-production"
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids

  cluster_endpoint_public_access = true

  # Managed Node Groups
  eks_managed_node_groups = {
    # Standard compute for Auth, Routing, Telemetry
    standard = {
      min_size     = 3
      max_size     = 10
      desired_size = 3
      
      instance_types = ["m6i.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
    
    # GPU Compute for Computer Vision & Predictive Modeling
    gpu_accelerated = {
      min_size     = 1
      max_size     = 5
      desired_size = 1

      instance_types = ["g5.xlarge", "p4d.24xlarge"]
      capacity_type  = "SPOT" # Cost savings for heavy compute
      
      # Taints to ensure only specific workloads land here
      taints = [
        {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }

  tags = {
    Environment = "production"
    Project     = "crowdflow"
  }
}
