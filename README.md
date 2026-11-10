<div align="center">

# Algolizer

### Visualize Algorithms Like Never Before.

An interactive learning platform that brings algorithms, data structures, and digital electronics to life through visualizations and animations.

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## About

**Algolizer** is an interactive educational platform designed to make complex computer science concepts easier to understand.

Instead of just reading theory or looking at code, explore how algorithms execute, how data structures behave, and how digital logic works through interactive visualizations.

Whether you're learning sorting algorithms, exploring graph traversal, understanding data structures, or experimenting with digital electronics, Algolizer makes learning more visual and engaging.

## Features

### Sorting Visualizer
Explore and understand popular sorting algorithms through animated visualizations.

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Interactive controls and visualization modes
- Pseudocode and algorithm statistics

### Graph Visualizer
Experiment with graph traversal and shortest-path algorithms.

- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra's Shortest Path Algorithm
- Create custom graphs
- Add weighted edges
- Drag and reposition nodes
- Visualize traversal paths

### Data Structures Visualizer
Understand how fundamental data structures operate.

- Stack
- Queue
- Singly Linked List
- Doubly Linked List
- Circular Linked List
- Binary Search Tree (BST)
- Interactive insertion, deletion, and search operations

### Digital Electronics
Explore important concepts in digital electronics through interactive tools.

- Logic Gates
- Karnaugh Maps (K-Maps)
- Flip-Flops
- Boolean Algebra

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| Motion | Animations |
| Lucide React | Icons |

## Getting Started

Follow these steps to run Algolizer locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/vishnuprasad06/Algolizer.git
```

### 2. Navigate to the project directory

```bash
cd Algolizer
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal to explore Algolizer.

### 5. Build for production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Project Structure

```text
Algolizer/
│
├── public/
│   └── assets/
│
├── src/
│   ├── algorithms/
│   │   └── sorting.ts
│   │
│   ├── components/
│   │   ├── SortingVisualizer.tsx
│   │   ├── GraphVisualizer.tsx
│   │   ├── DSVisualizer.tsx
│   │   ├── DigitalVisualizer.tsx
│   │   └── Tile.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Screenshots

### Home Page
![Algolizer Home Page](./screenshots/home.png)

### Sorting Visualizer
![Sorting Visualizer](./screenshots/sorting.png)

### Graph Visualizer
![Graph Visualizer](./screenshots/graph.png)

### Data Structures Visualizer
![Data Structures Visualizer](./screenshots/data-structures.png)


## Contributing

Contributions, suggestions, and improvements are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Commit your changes.
5. Open a Pull Request.

## License

This project is open source. You can add a license file to specify the terms under which others may use and contribute to it.

---

<div align="center">

**Built with curiosity and a passion for computer science.**

### Algolizer — Visualize Algorithms Like Never Before.

</div>