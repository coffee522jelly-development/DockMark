import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const SystemMonitorWidget: React.FC = () => {
  const { t } = useTranslation();
  const [memoryInfo, setMemoryInfo] = useState<chrome.system.memory.MemoryInfo | null>(null);
  const [cpuInfo, setCpuInfo] = useState<chrome.system.cpu.CpuInfo | null>(null);

  useEffect(() => {
    const fetchSystemInfo = () => {
      if (typeof chrome !== 'undefined' && chrome.system) {
        if (chrome.system.memory) {
          chrome.system.memory.getInfo((info) => setMemoryInfo(info));
        }
        if (chrome.system.cpu) {
          chrome.system.cpu.getInfo((info) => setCpuInfo(info));
        }
      } else {
        // Mock data for dev
        setMemoryInfo({ capacity: 17179869184, availableCapacity: 8589934592 });
        setCpuInfo({ numOfProcessors: 8, modelName: "Mock CPU (8 cores)", archName: "x86_64", features: [], processors: new Array(8).fill({ usage: { kernel: 0, user: 0, idle: 0, total: 100 } }) });
      }
    };

    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(1) + ' GB';
  };

  const getMemoryUsagePercent = () => {
    if (!memoryInfo) return 0;
    const used = memoryInfo.capacity - memoryInfo.availableCapacity;
    return Math.round((used / memoryInfo.capacity) * 100);
  };

  return (
    <GlassCard className="h-80" noPadding>
      <div className="p-4 flex flex-col h-full">
        <h2 className="card-title text-sm flex items-center gap-2 text-base-content mb-4">
          <Cpu size={16} className="text-primary" />
          {/* @ts-ignore - system is dynamically added to widgets in our translation update */}
          {t.widgets?.system?.title || 'System Monitor'}
        </h2>

        <div className="flex-1 flex flex-col gap-4">
          {/* Memory Section */}
          <div className="bg-base-200/50 p-3 rounded-xl border border-base-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1">
                <HardDrive size={14} /> Memory
              </span>
              <span className="text-xs opacity-70">
                {memoryInfo ? `${formatBytes(memoryInfo.capacity - memoryInfo.availableCapacity)} / ${formatBytes(memoryInfo.capacity)}` : 'Loading...'}
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getMemoryUsagePercent()}%` }}
              ></div>
            </div>
            <div className="text-right text-[10px] opacity-50 mt-1">{getMemoryUsagePercent()}% Used</div>
          </div>

          {/* CPU Section */}
          <div className="bg-base-200/50 p-3 rounded-xl border border-base-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-semibold flex items-center gap-1 mb-2">
              <Cpu size={14} /> CPU
            </div>
            {cpuInfo ? (
              <div className="text-xs space-y-1 opacity-80">
                <p className="truncate" title={cpuInfo.modelName}>{cpuInfo.modelName}</p>
                <p className="text-[10px] opacity-60">Architecture: {cpuInfo.archName}</p>
                <p className="text-[10px] opacity-60">Logical Processors: {cpuInfo.processors.length}</p>
              </div>
            ) : (
              <div className="text-xs opacity-50">Loading CPU Info...</div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default SystemMonitorWidget;
