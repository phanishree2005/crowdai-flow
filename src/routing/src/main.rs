use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::transport::Server;
use tracing::{info, Level};

mod graph;
mod pathfinder;
mod service;

use service::RoutingServiceServerImpl;
use crate::service::routing_proto::routing_service_server::RoutingServiceServer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // 1. Initialize Tracing
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .init();

    info!("Starting CrowdFlow Routing Engine...");

    // 2. Initialize Spatial Graph (Thread-Safe)
    let spatial_graph = Arc::new(RwLock::new(graph::SpatialGraph::new()));
    
    // Seed some dummy graph data for testing
    {
        let mut sg = spatial_graph.write().await;
        sg.seed_test_data();
    }

    info!("Spatial Graph initialized");

    // 3. Setup gRPC Server
    let addr = "[::]:9002".parse()?;
    let routing_service = RoutingServiceServerImpl::new(spatial_graph.clone());

    info!("gRPC Routing Server listening on {}", addr);

    Server::builder()
        .add_service(RoutingServiceServer::new(routing_service))
        .serve(addr)
        .await?;

    Ok(())
}
