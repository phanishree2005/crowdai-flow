use crate::graph::{SpatialGraph, Node};
use std::collections::{BinaryHeap, HashMap};
use std::cmp::Ordering;

#[derive(Copy, Clone, PartialEq)]
struct State {
    cost: f32,
    position: u64,
}

// Ensure the binary heap is a min-heap
impl Eq for State {}

impl Ord for State {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.partial_cmp(&self.cost).unwrap_or(Ordering::Equal)
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

// Heuristic: Straight-line distance using Haversine or simple Euclidean
fn heuristic(n1: &Node, n2: &Node) -> f32 {
    // Simplified Euclidean for scaffold
    let dist = ((n1.lat - n2.lat).powi(2) + (n1.lon - n2.lon).powi(2)).sqrt();
    (dist * 111320.0) as f32 // roughly degrees to meters
}

// Dynamic A* search
pub fn a_star_search(
    graph: &SpatialGraph,
    start_id: u64,
    goal_id: u64,
) -> Option<(Vec<u64>, f32)> {
    let mut distances: HashMap<u64, f32> = HashMap::new();
    let mut came_from: HashMap<u64, u64> = HashMap::new();
    let mut heap = BinaryHeap::new();

    let goal_node = match graph.nodes.get(&goal_id) {
        Some(node) => node,
        None => return None,
    };

    distances.insert(start_id, 0.0);
    heap.push(State { cost: 0.0, position: start_id });

    while let Some(State { cost: _, position }) = heap.pop() {
        if position == goal_id {
            // Reconstruct path
            let mut path = vec![position];
            let mut current = position;
            while let Some(&prev) = came_from.get(&current) {
                path.push(prev);
                current = prev;
            }
            path.reverse();
            return Some((path, *distances.get(&goal_id).unwrap()));
        }

        if let Some(edges) = graph.adjacency_list.get(&position) {
            for edge in edges {
                let next = edge.target;
                let current_cost = *distances.get(&position).unwrap_or(&f32::MAX);
                let new_cost = current_cost + edge.current_cost_seconds();

                if new_cost < *distances.get(&next).unwrap_or(&f32::MAX) {
                    distances.insert(next, new_cost);
                    came_from.insert(next, position);
                    
                    let next_node = graph.nodes.get(&next).unwrap();
                    let priority = new_cost + heuristic(next_node, goal_node);
                    
                    heap.push(State { cost: priority, position: next });
                }
            }
        }
    }

    None // No path found
}
