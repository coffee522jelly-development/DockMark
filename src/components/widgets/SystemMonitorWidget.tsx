import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, Monitor, Database } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import { useTranslation } from '../../contexts/LanguageContext';

const SystemMonitorWidget: React.FC = () => {
  const { t } = useTranslation();
  const [memoryInfo, setMemoryInfo] = useState<chrome.system.memory.MemoryInfo | null>(null);
  const [cpuInfo, setCpuInfo] = useState<chrome.system.cpu.CpuInfo | null>(null);
  const [prevCpuInfo, setPrevCpuInfo] = useState<chrome.system.cpu.CpuInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<chrome.system.storage.StorageUnitInfo[]>([]);
  const [displayInfo, setDisplayInfo] = useState<chrome.system.display.DisplayInfo[]>([]);

  useEffect(() => {
    const fetchSystemInfo = () => {
      if (typeof chrome !== 'undefined' && chrome.system) {
        if (chrome.system.memory) {
          chrome.system.memory.getInfo((info) => setMemoryInfo(info));
        }
        if (chrome.system.cpu) {
          chrome.system.cpu.getInfo((info) => {
            setCpuInfo((prev) => {
              if (prev) setPrevCpuInfo(prev);
              return info;
            });
          });
        }
        if (chrome.system.storage) {
          chrome.system.storage.getInfo((info) => setStorageInfo(info));
        }
        if (chrome.system.display) {
          chrome.system.display.getInfo((info) => setDisplayInfo(info));
        }
      } else {
        // Mock data for dev
        setMemoryInfo({ capacity: 17179869184, availableCapacity: 8589934592 });
        setCpuInfo({ numOfProcessors: 8, modelName: "Mock CPU (8 cores)", archName: "x86_64", features: ['mmx', 'sse'], processors: new Array(8).fill({ usage: { kernel: 10, user: 20, idle: 70, total: 100 } }) });
        setStorageInfo([{ id: '1', name: 'Macintosh HD', type: 'fixed', capacity: 512110190592 }]);
        setDisplayInfo([{ id: '1', name: 'Built-in Retina Display', activeState: 'active', bounds: { left: 0, top: 0, width: 2560, height: 1600 } } as any]);
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
    <GlassCard className="aspect-square overflow-hidden" noPadding>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-bold text-base-content flex items-center gap-2 m-0">
            <Cpu className="w-5 h-5 text-primary" />
            {/* @ts-ignore - system is dynamically added to widgets in our translation update */}
            {t.widgets?.system?.title || 'System Monitor'}
          </h3>
        </div>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {/* Memory Section */}
          <div className="bg-base-200/50 p-1.5 rounded-xl border border-base-300">
            <div className="flex items-center justify-between mb-1">
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
            <div className="text-right text-xs opacity-50 mt-1">{getMemoryUsagePercent()}% Used</div>
          </div>

          {/* CPU Section */}
          <div className="bg-base-200/50 p-1.5 rounded-xl border border-base-300 flex-1 overflow-y-auto custom-scrollbar">
            <div className="text-xs font-semibold flex items-center gap-1 mb-1">
              <Cpu size={14} /> CPU
            </div>
            {cpuInfo ? (
              <div className="text-xs space-y-2 opacity-80">
                <p className="truncate" title={cpuInfo.modelName}>{cpuInfo.modelName}</p>
                <div className="flex justify-between">
                  <p className="text-xs opacity-60">Arch: {cpuInfo.archName}</p>
                  <p className="text-xs opacity-60">Cores: {cpuInfo.numOfProcessors}</p>
                </div>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  {cpuInfo.processors.map((p, i) => {
                    let usagePercent = 0;
                    if (prevCpuInfo && prevCpuInfo.processors[i]) {
                      const prevP = prevCpuInfo.processors[i];
                      const active = (p.usage.user + p.usage.kernel) - (prevP.usage.user + prevP.usage.kernel);
                      const total = p.usage.total - prevP.usage.total;
                      usagePercent = total > 0 ? Math.round((active / total) * 100) : 0;
                    } else {
                      usagePercent = p.usage.total > 0 ? Math.round(((p.usage.user + p.usage.kernel) / p.usage.total) * 100) : 0;
                    }
                    return (
                      <div key={i} className="text-xs flex flex-col items-center opacity-70">
                        <div className="w-full bg-base-300 h-1 mb-1 rounded-full overflow-hidden">
                          <div className="bg-info h-full transition-all" style={{ width: `${usagePercent}%` }} />
                        </div>
                        {usagePercent}%
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs opacity-50">Loading CPU Info...</div>
            )}
          </div>

          {/* Displays Section */}
          {displayInfo.length > 0 && (
            <div className="bg-base-200/50 p-1.5 rounded-xl border border-base-300">
              <div className="text-xs font-semibold flex items-center gap-1 mb-1">
                <Monitor size={14} /> Displays
              </div>
              <div className="text-xs space-y-1 opacity-80 max-h-16 overflow-y-auto custom-scrollbar">
                {displayInfo.map((d) => (
                  <div key={d.id} className="flex justify-between items-center bg-base-300/30 p-1 rounded">
                    <span className="truncate max-w-[80px]" title={d.name}>{d.name}</span>
                    <span>{d.bounds.width}x{d.bounds.height}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Section */}
          {storageInfo.length > 0 && (
            <div className="bg-base-200/50 p-1.5 rounded-xl border border-base-300">
              <div className="text-xs font-semibold flex items-center gap-1 mb-1">
                <Database size={14} /> Storage Devices
              </div>
              <div className="text-xs space-y-1 opacity-80 max-h-16 overflow-y-auto custom-scrollbar">
                {storageInfo.map(s => (
                  <div key={s.id} className="flex justify-between items-center bg-base-300/30 p-1 rounded">
                    <span className="truncate max-w-[80px]" title={s.name}>{s.name} ({s.type})</span>
                    <span>{formatBytes(s.capacity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </GlassCard>
  );
};

export default SystemMonitorWidget;
