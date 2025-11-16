// src/components/ArchitectureTab.jsx
import FunctionCallGraph from './FunctionCallGraph';

export default function ArchitectureTab() {
  return (
    <div className="w-full h-full bg-gray-800 text-white">
      {/* Optional header */}
      <div className="p-4 text-2xl font-bold">
        Architecture
      </div>

      {/* Graph area */}
      <div className="w-full h-[calc(100%-4rem)]">
        <FunctionCallGraph />
      </div>
    </div>
  );
}