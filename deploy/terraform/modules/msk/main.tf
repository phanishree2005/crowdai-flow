variable "cluster_name" {
  type    = string
  default = "crowdflow-kafka"
}

variable "vpc_id" {
  type = string
}

variable "client_subnets" {
  type = list(string)
}

resource "aws_msk_cluster" "crowdflow_msk" {
  cluster_name           = var.cluster_name
  kafka_version          = "3.5.1"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.large"
    client_subnets  = var.client_subnets
    security_groups = [aws_security_group.msk.id]
    
    storage_info {
      ebs_storage_info {
        volume_size = 1000 # GB
      }
    }
  }

  client_authentication {
    unauthenticated = false
    sasl {
      iam   = true
      scram = false
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  tags = {
    Environment = "production"
    Project     = "crowdflow"
  }
}

resource "aws_security_group" "msk" {
  name        = "crowdflow-msk-sg"
  description = "Allow inbound traffic for MSK from EKS"
  vpc_id      = var.vpc_id

  ingress {
    description = "TLS communication"
    from_port   = 9094
    to_port     = 9094
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Adjust to VPC CIDR
  }

  ingress {
    description = "IAM Auth communication"
    from_port   = 9098
    to_port     = 9098
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}
