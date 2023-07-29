export const languages = [
  { value: 'Select', label: '' },
  {
    value: 'python',
    label: 'Python',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
  },
  {
    value: 'java',
    label: 'Java',
  },
  {
    value: 'c',
    label: 'C',
  },
  {
    value: 'c++',
    label: 'C++',
  },
  {
    value: 'ruby',
    label: 'Ruby',
  },
  {
    value: 'rust',
    label: 'Rust',
  },
  {
    value: 'go',
    label: 'Go',
  },
] as const;

export type Languages = (typeof languages)[number]['value'];
export const python = `
from typing import List, Dict

NodeID = str  # uuid representing a node
AdjacencyList = Dict[NodeID, List[NodeID]]
VisitedIDs = List[NodeID]
Visualization = List[VisitedIDs]

def algorithm(adjList: AdjacencyList) -> Visualization:
    # your code here
    pass
`;
export const javascript = `
// NodeID: string (uuid representing a node)
// AdjacencyList: Object with NodeID keys and array of NodeID values
// VisitedIDs: array of NodeID
// Visualization: array of VisitedIDs

function algorithm(adjList) {
    // adjList: AdjacencyList

    // your code here
}
`;

export const java = `
import java.util.*;

public class Main {
    // Using String for NodeID as it represents a uuid
    // Using HashMap to represent AdjacencyList and ArrayList for the lists

    public static ArrayList<ArrayList<String>> algorithm(HashMap<String, ArrayList<String>> adjList) {
        // your code here
        return null;
    }
}
`;

export const c = `
#include <stdio.h>

// NodeID: char array (string, uuid representing a node)
// AdjacencyList: array of NodeID pointers
// VisitedIDs: array of NodeID
// Visualization: array of VisitedIDs

void algorithm(char *adjList[]) {
    // adjList: AdjacencyList

    // your code here
}
`;

export const cpp = `
#include <string>
#include <vector>
#include <map>

// NodeID: string (uuid representing a node)
// AdjacencyList: map with NodeID keys and vector of NodeID values
// VisitedIDs: vector of NodeID
// Visualization: vector of VisitedIDs

typedef std::string NodeID;
typedef std::map<NodeID, std::vector<NodeID>> AdjacencyList;
typedef std::vector<NodeID> VisitedIDs;
typedef std::vector<VisitedIDs> Visualization;

Visualization algorithm(AdjacencyList adjList) {
    // your code here
}
`;

export const ruby = `
# NodeID: String (uuid representing a node)
# AdjacencyList: Hash with NodeID keys and Array of NodeID values
# VisitedIDs: Array of NodeID
# Visualization: Array of VisitedIDs

def algorithm(adjList)
  # adjList: AdjacencyList

  # your code here
end
`;

export const rust = `
use std::collections::HashMap;

// NodeID: String (uuid representing a node)
// AdjacencyList: HashMap with NodeID keys and Vec of NodeID values
// VisitedIDs: Vec of NodeID
// Visualization: Vec of VisitedIDs

type NodeID = String;
type AdjacencyList = HashMap<NodeID, Vec<NodeID>>;
type VisitedIDs = Vec<NodeID>;
type Visualization = Vec<VisitedIDs>;

fn algorithm(adj_list: AdjacencyList) -> Visualization {
    // your code here
    Vec::new()
}
`;

export const go = `
package main

// NodeID: string (uuid representing a node)
// AdjacencyList: map with NodeID keys and slice of NodeID values
// VisitedIDs: slice of NodeID
// Visualization: slice of VisitedIDs

type NodeID string
type AdjacencyList map[NodeID][]NodeID
type VisitedIDs []NodeID
type Visualization []VisitedIDs

func algorithm(adjList AdjacencyList) Visualization {
    // your code here
    return nil
}
`;
