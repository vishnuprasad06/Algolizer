import {
  BarChart3,
  Binary,
  Network,
  Home as HomeIcon,
  ChevronRight,
  Zap,
  Layers,
  Cpu,
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

import { SortingVisualizer } from './components/SortingVisualizer';
import { GraphVisualizer } from './components/GraphVisualizer';
import { DSVisualizer } from './components/DSVisualizer';
import { DigitalVisualizer } from './components/DigitalVisualizer';

type Page = 'home' | 'sorting' | 'graph' | 'ds' | 'digital';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<Page>;
      setCurrentPage(customEvent.detail);
      window.scrollTo(0, 0);
    };

    window.addEventListener('nav', handleNav);

    return () => window.removeEventListener('nav', handleNav);
  }, []);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon size={17} /> },
    { id: 'sorting', label: 'Sorting', icon: <BarChart3 size={17} /> },
    { id: 'graph', label: 'Graphs', icon: <Network size={17} /> },
    { id: 'ds', label: 'Structures', icon: <Binary size={17} /> },
    { id: 'digital', label: 'Digital', icon: <Cpu size={17} /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'sorting':
        return <SortingVisualizer />;

      case 'graph':
        return <GraphVisualizer />;

      case 'ds':
        return <DSVisualizer />;

      case 'digital':
        return <DigitalVisualizer />;

      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white grid-bg">

      {/* NAVIGATION */}

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100">

        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[76px] flex items-center justify-between">

          {/* BRAND */}

          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-3 bg-transparent border-0"
          >
            <img
              src="/algolizer-mark.png"
              alt="Algolizer"
             className="w-12 h-12 rounded-full object-contain"
            />

            <span className="text-2xl font-extrabold tracking-tight text-blue-700">
              Algolizer
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden md:flex items-center gap-1">

            {navItems.map((item) => {
              const active = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as Page)}
                  className={`
                    flex items-center gap-2
                    px-4 py-2.5 rounded-lg
                    text-sm font-semibold
                    border transition-all duration-200
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-transparent text-gray-600 border-transparent hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}

          </div>

          {/* MOBILE BRAND STATUS */}

          <div className="md:hidden flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <span className="text-xs font-semibold text-gray-500">
              Online
            </span>
          </div>

        </div>

        {/* MOBILE NAVIGATION */}

        <div className="md:hidden flex overflow-x-auto px-3 pb-3 gap-2">

          {navItems.map((item) => {
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id as Page)}
                className={`
                  flex items-center gap-2 whitespace-nowrap
                  px-4 py-2 rounded-lg text-xs font-semibold
                  border transition-all
                  ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}

        </div>

      </nav>

      {/* MAIN CONTENT */}

      <main className="min-h-[75vh]">

        <AnimatePresence mode="wait">

          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>

        </AnimatePresence>

      </main>

      {/* FOOTER */}

      <footer className="mt-16 border-t border-blue-100 bg-white">

        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <img
              src="/algolizer-mark.png"
              alt=""
              className="w-9 h-9 rounded-full object-contain"
            />

            <span className="font-bold text-blue-700">
              Algolizer
            </span>

          </div>

          <p className="text-sm text-gray-500 text-center">
            Visualize algorithms like never before.
          </p>

          <p className="text-xs text-gray-400">
            Designed & built by Vishnu Prasad K J © 2026
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================
   HOMEPAGE
========================================= */

const Home: React.FC<{
  navigate: (p: Page) => void;
}> = ({ navigate }) => {

  const cards = [
    {
      page: 'sorting' as Page,
      title: 'Sorting Algorithms',
      number: '01',
      icon: <BarChart3 size={25} />,
      description:
        'Understand how sorting algorithms organize data through interactive step-by-step animations.',

      accent: '#2563EB',
      tags: ['Bubble Sort', 'Quick Sort', 'Merge Sort'],
    },

    {
      page: 'graph' as Page,
      title: 'Graph Algorithms',
      number: '02',
      icon: <Network size={25} />,
      description:
        'Explore graph traversal and shortest-path algorithms using interactive nodes and connections.',

      accent: '#16A34A',
      tags: ['BFS', 'DFS', 'Dijkstra'],
    },

    {
      page: 'ds' as Page,
      title: 'Data Structures',
      number: '03',
      icon: <Layers size={25} />,
      description:
        'Visualize how fundamental data structures store, organize and manipulate information.',

      accent: '#DC2626',
      tags: ['Stack', 'Queue', 'Linked List'],
    },

    {
      page: 'digital' as Page,
      title: 'Digital Electronics',
      number: '04',
      icon: <Cpu size={25} />,
      description:
        'Explore digital logic, Boolean expressions and fundamental digital electronics concepts.',

      accent: '#2563EB',
      tags: ['Logic Gates', 'K-Maps', 'Flip-Flops'],
    },
  ];

  return (

    <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24">

      {/* HERO */}

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center mb-20"
      >

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide mb-8">

          <Zap size={14} />

          INTERACTIVE LEARNING PLATFORM

        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">

          Visualize

          <span className="text-blue-600"> algorithms </span>

          like never before.

        </h1>

        <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">

          Learn algorithms and data structures through interactive
          visualizations. Understand every operation, follow every
          step and explore how things work.

        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-9">

          <button
            onClick={() => navigate('sorting')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all"
          >
            Explore Visualizers
            <ChevronRight size={17} />
          </button>

          <button
            onClick={() => navigate('graph')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 rounded-lg font-semibold text-sm transition-all"
          >
            Explore Graphs
          </button>

        </div>

      </motion.section>


      {/* SECTION HEADING */}

      <section>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
              Explore
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Learning Modules
            </h2>

          </div>

          <p className="text-sm text-gray-500">
            Choose a module to get started.
          </p>

        </div>


        {/* MODULE CARDS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {cards.map((card, index) => (

            <motion.button
              key={card.page}
              onClick={() => navigate(card.page)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group text-left bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/60"
            >

              <div className="flex items-center justify-between mb-7">

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${card.accent}10`,
                    color: card.accent,
                  }}
                >
                  {card.icon}
                </div>

                <span className="text-sm font-mono font-semibold text-gray-300">
                  {card.number}
                </span>

              </div>


              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {card.title}
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {card.description}
              </p>


              <div className="flex flex-wrap gap-2 mb-6">

                {card.tags.map(tag => (

                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </span>

                ))}

              </div>


              <div className="flex items-center justify-between pt-4 border-t border-gray-100">

                <span className="text-sm font-bold text-blue-600">
                  Explore module
                </span>

                <ChevronRight
                  size={18}
                  className="text-blue-600 group-hover:translate-x-1 transition-transform"
                />

              </div>

            </motion.button>

          ))}

        </div>

      </section>


      {/* FEATURES */}

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 bg-blue-50/60 border border-blue-100 rounded-2xl p-8 md:p-10"
      >

        <div className="text-center mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Learn by visualizing.
          </h2>

          <p className="text-sm text-gray-500">
            Designed to make complex concepts easier to understand.
          </p>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          {[
            { value: '10+', label: 'Algorithms' },
            { value: '5+', label: 'Data Structures' },
            { value: '8', label: 'Logic Gates' },
            { value: '100%', label: 'Interactive Learning' },
          ].map(item => (

            <div key={item.label}>

              <p className="text-3xl font-extrabold text-blue-600 mb-2">
                {item.value}
              </p>

              <p className="text-xs md:text-sm font-medium text-gray-500">
                {item.label}
              </p>

            </div>

          ))}

        </div>

      </motion.section>

    </div>
  );
};