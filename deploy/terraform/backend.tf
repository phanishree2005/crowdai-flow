terraform {
  backend "s3" {
    bucket         = "crowdflow-terraform-state-prod"
    key            = "core/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "crowdflow-terraform-locks"
  }
}
