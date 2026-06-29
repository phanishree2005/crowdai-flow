use std::sync::Arc;
use tokio::sync::RwLock;
use tonic::{Request, Response, Status};

use crate::graph::SpatialGraph;
use crate::pathfinder::a_star_search;

pub mod routing_proto {
    tonic::include_proto!("crowdflow.routing.v1");
}

use routing_proto::routing_service_server::RoutingService;
use routing_proto::{GetRouteRequest, GetRouteResponse, Coordinate, Waypoint};

pub struct RoutingServiceServerImpl {
    spatial_graph: Arc<RwLock<SpatialGraph>>,
}

impl RoutingServiceServerImpl {
    pub fn new(spatial_graph: Arc<RwLock<SpatialGraph>>) -> Self {
        Self { spatial_graph }
    }
}

#[tonic::async_trait]
impl RoutingService for RoutingServiceServerImpl {
    async fn get_route(
        &self,
        request: Request<GetRouteRequest>,
    ) -> Result<Response<GetRouteResponse>, Status> {
        let req = request.into_inner();
        
        let origin = req.origin.ok_or_else(|| Status::invalid_argument("missing origin"))?;
        let dest = req.destination.ok_or_else(|| Status::invalid_argument("missing destination"))?;

        let graph = self.spatial_graph.read().await;

        let start_node = graph.nearest_node(origin.latitude, origin.longitude)
            .ok_or_else(|| Status::not_found("Origin node not found"))?;
            
        let goal_node = graph.nearest_node(dest.latitude, dest.longitude)
            .ok_or_else(|| Status::not_found("Destination node not found"))?;

        match a_star_search(&graph, start_node, goal_node) {
            Some((path_node_ids, total_time)) => {
                let mut waypoints = Vec::new();
                for id in path_node_ids {
                    if let Some(node) = graph.nodes.get(&id) {
                        waypoints.push(Waypoint {
                            coordinate: Some(Coordinate {
                                latitude: node.lat,
                                longitude: node.lon,
                            }),
                            eta_seconds: 0, // Simplified for scaffold
                            instruction: "Proceed".to_string(),
                        });
                    }
                }

                let response = GetRouteResponse {
                    waypoints,
                    total_distance_meters: 0, // Simplified for scaffold
                    total_eta_seconds: total_time as i32,
                };
                
                Ok(Response::new(response))
            }
            None => {
                Err(Status::not_found("No route found between origin and destination"))
            }
        }
    }
}
