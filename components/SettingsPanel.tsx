
import React, { useState } from 'react';
import { User, Globe, Shield, ExternalLink, Mail, Building2, Save, Bell, Database, Tag, Trash2, Plus, Share2, ToggleLeft, ToggleRight, Check, Settings, Upload, FileText, X, BrainCircuit, Cloud, Server, Cpu, Play } from 'lucide-react';
import { UserSettings, SavedParameterSet, DataSource, SoilType, TrainedModel } from '../types';

interface Props {
    settings: UserSettings;
    onSettingsChange: (settings: UserSettings) => void;
}

const translations = {
  'English (US)': {
    nav: {
      profile: "Profile",
      defaults: "General & Defaults",
      params: "Parameter Sets",
      data: "Data Sources",
      models: "AI Material Models",
      cloud: "Cloud Compute",
      notifications: "Notifications"
    },
    profile: {
      displayName: "Display Name",
      email: "Email Address",
      bio: "Professional Bio",
      portfolio: "Portfolio"
    },
    defaults: {
      generalTitle: "General Preferences",
      units: "Measurement Units",
      language: "Interface Language",
      simTitle: "Simulation Defaults",
      defSoilType: "Default Soil Type",
      simQuality: "Simulation Quality",
      qualityHint: "Higher quality uses more particles and finer time steps."
    },
    params: {
      title: "Calibrated Parameter Sets",
      desc: "Manage saved simulation configurations.",
      create: "Create New",
      lastMod: "Last modified"
    },
    data: {
      title: "Experimental Data Sources",
      desc: "Connect external datasets for model validation.",
      add: "Add Source",
      addTitle: "Add New Dataset",
      name: "Dataset Name",
      method: "Input Method",
      manual: "Manual Input",
      upload: "Upload File",
      content: "JSON / CSV Content",
      cancel: "Cancel",
      save: "Process & Save",
      fileLoaded: "File loaded successfully",
      clickUpload: "Click \"Upload File\" button above to select .csv or .json"
    },
    models: {
      title: "Custom Material Models",
      desc: "Train and fine-tune material interaction models using experimental data.",
      train: "Train New Model",
      accuracy: "Accuracy",
      baseType: "Base Type",
      lastTrained: "Last Trained",
      datasets: "Datasets",
      linked: "linked",
      fineTune: "Fine-tune with New Data",
      training: "Training...",
      report: "View Report"
    },
    cloud: {
      title: "Cloud Compute Configuration",
      desc: "Manage offloading settings for heavy DEM simulations.",
      activeCluster: "Active Cluster",
      latency: "Latency",
      reconnect: "Re-connect",
      instance: "Instance Type",
      scaling: "Scaling Policy",
      rules: "Offloading Rules",
      autoOffload: { label: "Auto-Offload Large Batches", desc: "Automatically send simulations with >50 iterations to cloud." },
      secure: { label: "Secure Data Transfer (E2EE)", desc: "Encrypt all simulation results during transfer." }
    },
    notif: {
      title: "Notification Preferences",
      desc: "Control when and how you receive alerts.",
      batch: { label: "Batch Simulation Complete", desc: "Get notified when large parameter sweeps finish processing." },
      calib: { label: "Calibration Alerts", desc: "Alerts when real-time sensor data deviates significantly from model." },
      system: { label: "System Updates", desc: "News about new DEM features or soil models." },
      digest: { label: "Weekly Digest", desc: "Email summary of simulation activities and insights." }
    }
  },
  'Chinese (Simplified)': {
    nav: {
      profile: "个人资料",
      defaults: "通用与默认值",
      params: "参数集",
      data: "数据源",
      models: "AI材料模型",
      cloud: "云计算",
      notifications: "通知"
    },
    profile: {
      displayName: "显示名称",
      email: "电子邮件地址",
      bio: "职业简介",
      portfolio: "作品集"
    },
    defaults: {
      generalTitle: "通用首选项",
      units: "计量单位",
      language: "界面语言",
      simTitle: "仿真默认值",
      defSoilType: "默认土壤类型",
      simQuality: "仿真质量",
      qualityHint: "高质量使用更多粒子和更精细的时间步长。"
    },
    params: {
      title: "已校准参数集",
      desc: "管理已保存的仿真配置。",
      create: "新建",
      lastMod: "最后修改"
    },
    data: {
      title: "实验数据源",
      desc: "连接外部数据集以进行模型验证。",
      add: "添加源",
      addTitle: "添加新数据集",
      name: "数据集名称",
      method: "输入方式",
      manual: "手动输入",
      upload: "上传文件",
      content: "JSON / CSV 内容",
      cancel: "取消",
      save: "处理并保存",
      fileLoaded: "文件加载成功",
      clickUpload: "点击上方的“上传文件”按钮选择 .csv 或 .json"
    },
    models: {
      title: "自定义材料模型",
      desc: "使用实验数据训练和微调材料相互作用模型。",
      train: "训练新模型",
      accuracy: "准确率",
      baseType: "基础类型",
      lastTrained: "上次训练",
      datasets: "数据集",
      linked: "已关联",
      fineTune: "使用新数据微调",
      training: "训练中...",
      report: "查看报告"
    },
    cloud: {
      title: "云计算配置",
      desc: "管理重型DEM仿真的卸载设置。",
      activeCluster: "活动集群",
      latency: "延迟",
      reconnect: "重新连接",
      instance: "实例类型",
      scaling: "扩展策略",
      rules: "卸载规则",
      autoOffload: { label: "自动卸载大批量任务", desc: "自动将超过50次迭代的仿真发送到云端。" },
      secure: { label: "安全数据传输 (E2EE)", desc: "在传输过程中加密所有仿真结果。" }
    },
    notif: {
      title: "通知首选项",
      desc: "控制接收警报的时间和方式。",
      batch: { label: "批量仿真完成", desc: "当大型参数扫描处理完成时接收通知。" },
      calib: { label: "校准警报", desc: "当实时传感器数据与模型显着偏离时发出警报。" },
      system: { label: "系统更新", desc: "关于新DEM功能或土壤模型的新闻。" },
      digest: { label: "每周摘要", desc: "仿真活动和见解的电子邮件摘要。" }
    }
  }
};

const SettingsPanel: React.FC<Props> = ({ settings, onSettingsChange }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'defaults' | 'params' | 'data' | 'models' | 'cloud' | 'notifications'>('profile');
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState<{ name: string; type: 'CSV' | 'JSON' | 'Manual'; content: string }>({ name: '', type: 'CSV', content: '' });
  
  // Local state for other settings lists (mock data)
  const [savedParams, setSavedParams] = useState<SavedParameterSet[]>([
    { id: '1', name: 'Wet Clay Calibration', tags: ['Clay', 'High Moisture'], lastModified: '2024-05-20', params: {} },
    { id: '2', name: 'Sandy Soil Baseline', tags: ['Sand', 'Validation'], lastModified: '2024-05-18', params: {} },
    { id: '3', name: 'Straw Heavy Load', tags: ['Residue', 'Stress Test'], lastModified: '2024-05-15', params: {} },
  ]);

  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: '1', name: 'Field A-04 Telemetry', type: 'API', status: 'Connected', lastSync: 'Just now' },
    { id: '2', name: 'Lab Test Results 2023', type: 'CSV', status: 'Connected', lastSync: '2 days ago' },
    { id: '3', name: 'Soil Bin Experiment #42', type: 'CSV', status: 'Connected', lastSync: '1 week ago' },
  ]);

  const [models, setModels] = useState<TrainedModel[]>([
      { id: 'm1', name: 'Nanjing Loam v2', type: 'Soil', baseSoilType: 'Clay Loam', trainingDatasets: ['1', '2'], accuracy: 0.94, lastTrained: '2024-05-15', status: 'Ready', description: 'Optimized for high moisture retention.' },
      { id: 'm2', name: 'Rice Straw Breakage Model', type: 'Straw', trainingDatasets: ['3'], accuracy: 0.88, lastTrained: '2024-04-10', status: 'Needs Fine-tuning', description: 'Focuses on brittle fracture mechanics.' }
  ]);

  const [cloudConfig, setCloudConfig] = useState({
      provider: 'AWS',
      region: 'ap-northeast-1',
      clusterSize: 'Auto-scaling (2-8 Nodes)',
      instanceType: 'g5.2xlarge (NVIDIA A10G)',
      autoOffload: true
  });

  // Get current language strings
  const strings = translations[settings.preferences.language] || translations['English (US)'];

  const handleToggle = (key: keyof UserSettings['notifications']) => {
    onSettingsChange({
        ...settings,
        notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setNewSource({ ...newSource, name: file.name, type: file.name.endsWith('.json') ? 'JSON' : 'CSV' });
        const reader = new FileReader();
        reader.onload = (event) => {
            setNewSource(prev => ({ ...prev, content: event.target?.result as string }));
        };
        reader.readAsText(file);
    }
  };

  const handleAddSource = () => {
    if (!newSource.name) return;
    const newId = (dataSources.length + 1).toString();
    const source: DataSource = {
        id: newId,
        name: newSource.name,
        type: newSource.type === 'Manual' ? 'API' : newSource.type, // Map manual to API/Custom for now
        status: 'Connected',
        lastSync: 'Just now'
    };
    setDataSources([...dataSources, source]);
    setShowAddSource(false);
    setNewSource({ name: '', type: 'CSV', content: '' });
  };

  const handleTrainModel = (modelId: string) => {
    // Mock training process
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'Training' } : m));
    setTimeout(() => {
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'Ready', accuracy: Math.min(0.99, m.accuracy + 0.02), lastTrained: 'Just now' } : m));
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-1 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 px-2 mb-2">Settings</h2>
        
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label={strings.nav.profile} />
        <NavButton active={activeTab === 'defaults'} onClick={() => setActiveTab('defaults')} icon={<Globe size={18} />} label={strings.nav.defaults} />
        <NavButton active={activeTab === 'params'} onClick={() => setActiveTab('params')} icon={<Save size={18} />} label={strings.nav.params} />
        <div className="h-px bg-gray-100 my-1" />
        <NavButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<Database size={18} />} label={strings.nav.data} />
        <NavButton active={activeTab === 'models'} onClick={() => setActiveTab('models')} icon={<BrainCircuit size={18} />} label={strings.nav.models} />
        <div className="h-px bg-gray-100 my-1" />
        <NavButton active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} icon={<Cloud size={18} />} label={strings.nav.cloud} />
        <NavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label={strings.nav.notifications} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto p-6 lg:p-8">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-agri-600 to-emerald-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shrink-0">
                        SM
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">{settings.profile.name}</h3>
                        <p className="text-agri-700 font-medium">{settings.profile.role}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Building2 size={16} /> {settings.profile.organization}
                        </div>
                    </div>
                    <a href="https://sagni-miressa-profes-umu5.bolt.host/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <ExternalLink size={16} /> {strings.profile.portfolio}
                    </a>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">{strings.profile.bio}</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">{settings.profile.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{strings.profile.displayName}</label>
                        <input type="text" value={settings.profile.name} readOnly className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">{strings.profile.email}</label>
                        <input type="email" value="sagni.miressa@example.edu.cn" readOnly className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>
            </div>
        )}

        {/* DEFAULTS TAB */}
        {activeTab === 'defaults' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{strings.defaults.generalTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{strings.defaults.units}</label>
                            <select 
                                value={settings.preferences.units}
                                onChange={(e) => onSettingsChange({...settings, preferences: {...settings.preferences, units: e.target.value as any}})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                            >
                                <option>Metric (SI)</option>
                                <option>Imperial</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{strings.defaults.language}</label>
                            <select 
                                value={settings.preferences.language}
                                onChange={(e) => onSettingsChange({...settings, preferences: {...settings.preferences, language: e.target.value as any}})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                            >
                                <option>English (US)</option>
                                <option>Chinese (Simplified)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{strings.defaults.simTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{strings.defaults.defSoilType}</label>
                            <select 
                                value={settings.defaults.soilType}
                                onChange={(e) => onSettingsChange({...settings, defaults: {...settings.defaults, soilType: e.target.value as SoilType}})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                            >
                                <option value="Clay Loam">Clay Loam</option>
                                <option value="Sandy Loam">Sandy Loam</option>
                                <option value="Silt">Silt</option>
                                <option value="Heavy Clay">Heavy Clay</option>
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{strings.defaults.simQuality}</label>
                            <select 
                                value={settings.defaults.simulationQuality}
                                onChange={(e) => onSettingsChange({...settings, defaults: {...settings.defaults, simulationQuality: e.target.value as any}})}
                                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 outline-none"
                            >
                                <option>Low (Fast)</option>
                                <option>Medium</option>
                                <option>High (Accurate)</option>
                            </select>
                            <p className="text-xs text-gray-500">{strings.defaults.qualityHint}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* PARAMETER SETS TAB */}
        {activeTab === 'params' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{strings.params.title}</h3>
                        <p className="text-sm text-gray-500">{strings.params.desc}</p>
                    </div>
                    <button className="px-4 py-2 bg-agri-700 text-white rounded-lg text-sm font-medium hover:bg-agri-800 transition-colors flex items-center gap-2">
                        <Plus size={16} /> {strings.params.create}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {savedParams.map(param => (
                        <div key={param.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-agri-200 transition-colors group">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-800 group-hover:text-agri-700">{param.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{strings.params.lastMod}: {param.lastModified}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <div className="flex gap-1">
                                        {param.tags.map(tag => (
                                            <span key={tag} className="bg-gray-100 text-gray-600 px-1.5 rounded flex items-center gap-1">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Share2 size={18} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* AI MODELS TAB */}
        {activeTab === 'models' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BrainCircuit className="text-purple-600" /> {strings.models.title}
                        </h3>
                        <p className="text-sm text-gray-500">{strings.models.desc}</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                        <Plus size={16} /> {strings.models.train}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {models.map(model => (
                        <div key={model.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        {model.name}
                                        {model.status === 'Ready' && <CheckCircleBadge />}
                                        {model.status === 'Training' && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full animate-pulse">{strings.models.training}</span>}
                                        {model.status === 'Needs Fine-tuning' && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Needs Fine-tuning</span>}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold uppercase text-gray-400">{strings.models.accuracy}</div>
                                    <div className="text-xl font-bold text-green-600">{(model.accuracy * 100).toFixed(1)}%</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div><span className="font-bold">{strings.models.baseType}:</span> {model.type} ({model.baseSoilType || 'N/A'})</div>
                                <div><span className="font-bold">{strings.models.lastTrained}:</span> {model.lastTrained}</div>
                                <div><span className="font-bold">{strings.models.datasets}:</span> {model.trainingDatasets.length} {strings.models.linked}</div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleTrainModel(model.id)}
                                    disabled={model.status === 'Training'}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-bold hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <BrainCircuit size={14} /> {model.status === 'Training' ? strings.models.training : strings.models.fineTune}
                                </button>
                                <button className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">
                                    {strings.models.report}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CLOUD CONFIG TAB */}
        {activeTab === 'cloud' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Cloud className="text-blue-500" /> {strings.cloud.title}
                    </h3>
                    <p className="text-sm text-gray-500">{strings.cloud.desc}</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Server className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900">{strings.cloud.activeCluster}: {cloudConfig.provider} ({cloudConfig.region})</h4>
                                <div className="text-xs text-blue-700 flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Operational</span>
                                    <span>•</span>
                                    <span>{strings.cloud.latency}: 45ms</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                            {strings.cloud.reconnect}
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-white p-3 rounded border border-blue-100">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">{strings.cloud.instance}</div>
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-2"><Cpu size={14} /> {cloudConfig.instanceType}</div>
                         </div>
                         <div className="bg-white p-3 rounded border border-blue-100">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">{strings.cloud.scaling}</div>
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-2"><ActivityIcon /> {cloudConfig.clusterSize}</div>
                         </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm">{strings.cloud.rules}</h4>
                    <NotificationToggle 
                        label={strings.cloud.autoOffload.label}
                        desc={strings.cloud.autoOffload.desc}
                        checked={cloudConfig.autoOffload}
                        onChange={() => setCloudConfig(prev => ({ ...prev, autoOffload: !prev.autoOffload }))}
                    />
                     <NotificationToggle 
                        label={strings.cloud.secure.label}
                        desc={strings.cloud.secure.desc}
                        checked={true}
                        onChange={() => {}}
                    />
                </div>
             </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{strings.notif.title}</h3>
                    <p className="text-sm text-gray-500">{strings.notif.desc}</p>
                </div>

                <div className="space-y-4">
                    <NotificationToggle 
                        label={strings.notif.batch.label}
                        desc={strings.notif.batch.desc}
                        checked={settings.notifications.batchComplete}
                        onChange={() => handleToggle('batchComplete')}
                    />
                    <NotificationToggle 
                        label={strings.notif.calib.label}
                        desc={strings.notif.calib.desc}
                        checked={settings.notifications.calibrationAlerts}
                        onChange={() => handleToggle('calibrationAlerts')}
                    />
                    <NotificationToggle 
                        label={strings.notif.system.label}
                        desc={strings.notif.system.desc}
                        checked={settings.notifications.systemUpdates}
                        onChange={() => handleToggle('systemUpdates')}
                    />
                    <NotificationToggle 
                        label={strings.notif.digest.label}
                        desc={strings.notif.digest.desc}
                        checked={settings.notifications.emailDigest}
                        onChange={() => handleToggle('emailDigest')}
                    />
                </div>
            </div>
        )}

        {/* DATA SOURCES TAB */}
        {activeTab === 'data' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{strings.data.title}</h3>
                        <p className="text-sm text-gray-500">{strings.data.desc}</p>
                    </div>
                    <button 
                        onClick={() => setShowAddSource(true)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> {strings.data.add}
                    </button>
                </div>
                
                {/* Upload Section */}
                {showAddSource && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800 text-sm">{strings.data.addTitle}</h4>
                            <button onClick={() => setShowAddSource(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{strings.data.name}</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                    placeholder="e.g. Field Survey 2024"
                                    value={newSource.name}
                                    onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{strings.data.method}</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setNewSource({...newSource, type: 'Manual'})}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded border ${newSource.type === 'Manual' ? 'bg-white border-agri-500 text-agri-700 shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-500'}`}
                                    >
                                        {strings.data.manual}
                                    </button>
                                    <label className={`flex-1 py-1.5 text-xs font-medium rounded border text-center cursor-pointer ${newSource.type !== 'Manual' ? 'bg-white border-agri-500 text-agri-700 shadow-sm' : 'border-transparent hover:bg-gray-100 text-gray-500'}`}>
                                        {strings.data.upload}
                                        <input type="file" className="hidden" accept=".csv,.json" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {newSource.type === 'Manual' ? (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">{strings.data.content}</label>
                                <textarea 
                                    className="w-full h-32 p-2 border border-gray-300 rounded text-xs font-mono"
                                    placeholder={`{"moisture": 22, "shear": 45}...`}
                                    value={newSource.content}
                                    onChange={(e) => setNewSource({...newSource, content: e.target.value})}
                                />
                            </div>
                        ) : (
                            <div className="mb-4 bg-white border border-dashed border-gray-300 rounded p-4 text-center">
                                {newSource.content ? (
                                    <div className="text-green-600 flex items-center justify-center gap-2 text-sm font-medium">
                                        <Check size={16} /> {strings.data.fileLoaded} ({newSource.type})
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                                        <Upload size={24} />
                                        <span>{strings.data.clickUpload}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowAddSource(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">{strings.data.cancel}</button>
                            <button 
                                onClick={handleAddSource}
                                disabled={!newSource.name || !newSource.content}
                                className="px-3 py-1.5 bg-agri-600 text-white rounded text-xs font-bold hover:bg-agri-700 disabled:opacity-50"
                            >
                                {strings.data.save}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {dataSources.map(source => (
                        <div key={source.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source.type === 'API' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                    {source.type === 'CSV' ? <FileText size={20} /> : <Database size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{source.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-mono bg-white px-1 rounded border border-gray-200">{source.type}</span>
                                        <span>Sync: {source.lastSync}</span>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                    <Check size={10} /> {source.status}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                    <Settings size={16} />
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            active 
            ? 'bg-agri-50 text-agri-700' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const NotificationToggle = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        <div>
            <div className="font-bold text-gray-800 text-sm">{label}</div>
            <div className="text-xs text-gray-500 mt-1">{desc}</div>
        </div>
        <button onClick={onChange} className={`transition-colors ${checked ? 'text-agri-600' : 'text-gray-300'}`}>
            {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
    </div>
);

const CheckCircleBadge = () => <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={8}/> Ready</span>;

// Simple icon component for display
const ActivityIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

export default SettingsPanel;
