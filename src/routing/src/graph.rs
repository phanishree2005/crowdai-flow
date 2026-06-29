use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub struct Node {
    pub id: u64,
    pub lat: f64,
    pub lon: f64,
}

#[derive(Debug, Clone)]
pub struct Edge {
    pub source: u64,
    pub target: u64,
    pub distance_meters: u32,
    pub base_speed_mps: f32,
    pub dynamic_congestion_multiplier: f32, // 1.0 = clear, >1.0 = congested
}

impl Edge {
    pub fn current_cost_seconds(&self) -> f32 {
        let current_speed = self.base_speed_mps / self.dynamic_congestion_multiplier;
        (self.distance_meters as f32) / current_speed
    }
}

pub struct SpatialGraph {
    pub nodes: HashMap<u64, Node>,
    pub adjacency_list: HashMap<u64, Vec<Edge>>,
}

impl SpatialGraph {
    pub fn new() -> Self {
        SpatialGraph {
            nodes: HashMap::new(),
            adjacency_list: HashMap::new(),
        }
    }

    pub fn seed_test_data(&mut self) {
        // Dummy data for scaffolding
        let n1 = Node { id: 1, lat: 40.7128, lon: -74.0060 };
        let n2 = Node { id: 2, lat: 40.7129, lon: -74.0061 };
        
        self.nodes.insert(1, n1);
        self.nodes.insert(2, n2);
        
        let edge = Edge {
            source: 1,
            target: 2,
            distance_meters: 100,
            base_speed_mps: 15.0,
            dynamic_congestion_multiplier: 1.0,
        };
        
        self.adjacency_list.insert(1, vec![edge]);
    }

    // Helper to find nearest node ID to given coordinates
    pub fn nearest_node(&self, lat: f64, lon: f64) -> Option<u64> {
        // In a real system, use an R-Tree or KD-Tree
        // For scaffold, we do a naive O(N) search
        let mut nearest: Option<u64> = None;
        let mut min_dist = f64::MAX;

        for (id, node) in &self.nodes {
            let dist = (node.lat - lat).powi(2) + (node.lon - lon).powi(2);
            if dist < min_dist {
                min_dist = dist;
                nearest = Some(*id);
            }
        }
        nearest
    }
}
