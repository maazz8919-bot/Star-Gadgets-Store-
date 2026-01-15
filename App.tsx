
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Project, Product, StockLog } from './types';
import { loadState, saveState, exportProject, importProjectFromFile } from './services/storage';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'history' | 'settings'>('home');
  const [isModalOpen, setIsModalOpen] = useState<'project' | 'product' | 'file' | 'edit' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Item for Actions
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImage, setFormImage] = useState('https://picsum.photos/400/400');

  // Long Press Timer
  // FIX: Using ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace errors in browser environment
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeProject = useMemo(() => 
    state.projects.find(p => p.id === state.activeProjectId),
    [state]
  );

  const filteredProducts = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeProject, searchQuery]);

  // Handlers
  const handleLongPress = (item: Product | Project, type: 'product' | 'project') => {
    if (type === 'product') {
      const product = item as Product;
      setSelectedProduct(product);
      // FIX: Access title directly from casted product
      setFormName(product.title);
      setFormPrice(product.mrp.toString());
      setIsModalOpen('edit');
    } else {
      const project = item as Project;
      setSelectedProject(project);
      // FIX: Access name directly from casted project
      setFormName(project.name);
      setIsModalOpen('edit');
    }
  };

  const startPress = (item: Product | Project, type: 'product' | 'project') => {
    timerRef.current = setTimeout(() => handleLongPress(item, type), 600);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const updateStock = (productId: string, delta: number) => {
    const log: StockLog = {
      id: Date.now().toString(),
      productId,
      type: delta > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(delta),
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === prev.activeProjectId 
        ? { 
            ...p, 
            history: [log, ...p.history],
            products: p.products.map(prod => 
              prod.id === productId 
              ? { ...prod, stock: Math.max(0, prod.stock + delta) }
              : prod
            )
          }
        : p
      )
    }));
  };

  const handleDelete = () => {
    if (selectedProduct) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === prev.activeProjectId 
          ? { ...p, products: p.products.filter(pr => pr.id !== selectedProduct.id) }
          : p
        )
      }));
    } else if (selectedProject) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== selectedProject.id),
        activeProjectId: state.activeProjectId === selectedProject.id ? null : state.activeProjectId
      }));
    }
    setIsModalOpen(null);
    setSelectedProduct(null);
    setSelectedProject(null);
  };

  const handleEditSave = () => {
    if (selectedProduct) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === prev.activeProjectId 
          ? { ...p, products: p.products.map(pr => pr.id === selectedProduct.id ? { ...pr, title: formName, mrp: Number(formPrice) } : pr) }
          : p
        )
      }));
    } else if (selectedProject) {
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === selectedProject.id ? { ...p, name: formName } : p)
      }));
    }
    setIsModalOpen(null);
  };

  const handleCreateProject = () => {
    const project: Project = {
      id: Date.now().toString(),
      name: formName || 'New Project',
      description: '',
      products: [],
      history: [],
      createdAt: Date.now()
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, project], activeProjectId: project.id }));
    setIsModalOpen(null);
    setFormName('');
  };

  const handleAddProduct = () => {
    const product: Product = {
      id: Date.now().toString(),
      title: formName,
      mrp: Number(formPrice),
      stock: Number(formStock) || 0,
      image: formImage,
      category: 'General',
      createdAt: Date.now()
    };
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === prev.activeProjectId ? { ...p, products: [product, ...p.products] } : p
      )
    }));
    setIsModalOpen(null);
    setFormName(''); setFormPrice(''); setFormStock('');
  };

  // UI Components
  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 footer-blur h-24 px-8 flex items-center justify-between z-[60] max-w-md mx-auto rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {[
        { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'inventory', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { id: 'history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ].map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`relative p-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-emerald-900 text-white scale-110 shadow-lg' : 'text-slate-400 hover:text-emerald-700'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
          </svg>
          {activeTab === tab.id && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-primary rounded-full"></span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfc] flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* Header */}
      <header className="luxury-gradient text-white pt-10 pb-16 px-8 rounded-b-[48px] relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">StockMaster <span className="gold-shimmer">Elite</span></h1>
            <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1">Status: Operational</p>
          </div>
          <button onClick={() => setIsModalOpen('file')} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
             <svg className="w-5 h-5 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </button>
        </div>
        
        {/* Floating Stat Card */}
        <div className="absolute left-8 right-8 -bottom-10 bg-white p-6 rounded-[32px] shadow-2xl border border-gold-primary/20 flex justify-between items-center">
          <div onClick={() => setIsModalOpen('project')} className="cursor-pointer">
             <p className="text-[10px] text-slate-400 font-bold uppercase">Active Project</p>
             <h2 className="text-lg font-bold text-emerald-950 truncate max-w-[150px]">{activeProject?.name || 'Create Project'}</h2>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-slate-400 font-bold uppercase">Total Value</p>
             <h2 className="text-lg font-bold text-emerald-900">₹{activeProject?.products.reduce((a,b) => a + (b.mrp * b.stock), 0).toLocaleString()}</h2>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-16 pb-32 overflow-y-auto">
        <div className="page-enter">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-emerald-950">Overview</h3>
                <span className="text-xs font-bold text-gold-primary">LATEST ACTIVITY</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="premium-card p-5">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                       <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <p className="text-2xl font-bold text-emerald-950">{activeProject?.products.length || 0}</p>
                    <p className="text-xs text-slate-400 font-medium">SKUs Listed</p>
                 </div>
                 <div className="premium-card p-5">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                       <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{activeProject?.products.filter(p => p.stock === 0).length || 0}</p>
                    <p className="text-xs text-slate-400 font-medium">Stock Alerts</p>
                 </div>
              </div>

              <div className="premium-card p-6 bg-emerald-950 text-white border-none relative overflow-hidden">
                 <div className="relative z-10">
                    <h4 className="font-bold mb-1">Elite Insights</h4>
                    <p className="text-xs text-white/60 mb-4">Your current stock levels are 82% efficient. Consider restocking top items.</p>
                    <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-gold-primary flex items-center gap-1">GO TO INVENTORY <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
                 </div>
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gold-primary/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Premium Search..." 
                  className="w-full bg-white premium-card py-4 px-12 focus:outline-none focus:border-gold-primary transition-all text-emerald-950 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gold-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>

              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onMouseDown={() => startPress(product, 'product')}
                  onMouseUp={endPress}
                  onTouchStart={() => startPress(product, 'product')}
                  onTouchEnd={endPress}
                  className="premium-card p-4 flex gap-4 animate-fade-in relative active:scale-[0.98] transition-all"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-gold-primary/10">
                    <img src={product.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-950">{product.title}</h4>
                      <p className="text-gold-primary font-bold text-sm">₹{product.mrp}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        QTY: {product.stock}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">-</button>
                        <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsModalOpen('product')}
                className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-bold border-b-4 border-gold-primary shadow-xl mt-4"
              >
                + ADD NEW LISTING
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-emerald-950">Activity Logs</h3>
              {activeProject?.history.length === 0 && <p className="text-slate-400 text-center py-20">No stock movements yet</p>}
              {activeProject?.history.map(log => {
                const prod = activeProject.products.find(p => p.id === log.productId);
                return (
                  <div key={log.id} className="premium-card p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {log.type === 'IN' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 text-sm">{prod?.title || 'Unknown Product'}</p>
                        <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${log.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {log.type === 'IN' ? '+' : '-'}{log.quantity}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-emerald-950">Project Vault</h3>
              <div className="space-y-4">
                {state.projects.map(p => (
                  <div 
                    key={p.id} 
                    onMouseDown={() => startPress(p, 'project')}
                    onMouseUp={endPress}
                    onClick={() => { setState(prev => ({ ...prev, activeProjectId: p.id })); setActiveTab('home'); }}
                    className={`premium-card p-5 border-2 transition-all cursor-pointer ${state.activeProjectId === p.id ? 'border-gold-primary bg-emerald-50/20' : 'border-transparent'}`}
                  >
                    <div className="flex justify-between items-center">
                       <h4 className="font-bold text-emerald-950">{p.name}</h4>
                       <span className="text-[10px] bg-white border border-slate-100 px-3 py-1 rounded-full">{p.products.length} Items</span>
                    </div>
                    <div className="flex gap-4 mt-3">
                       <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-bold">VALUE</p>
                          <p className="text-sm font-bold text-emerald-900">₹{p.products.reduce((a,b) => a + (b.mrp * b.stock), 0).toLocaleString()}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] text-slate-400 font-bold">ALERTS</p>
                          <p className="text-sm font-bold text-red-500">{p.products.filter(pr => pr.stock === 0).length}</p>
                       </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsModalOpen('project')} className="w-full py-4 border-2 border-dashed border-gold-primary/30 rounded-2xl text-gold-primary font-bold hover:bg-gold-primary/5">
                   + CREATE NEW VAULT
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Action Sheets / Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-sm z-[100] flex items-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-[48px] p-8 animate-slide-up border-t-4 border-gold-primary max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-bold text-emerald-950 uppercase tracking-tight">
                 {isModalOpen === 'edit' ? 'Premium Actions' : isModalOpen === 'product' ? 'New Listing' : 'Configuration'}
               </h2>
               <button onClick={() => setIsModalOpen(null)} className="p-2 bg-slate-100 rounded-full">✕</button>
            </div>

            {isModalOpen === 'project' && (
              <div className="space-y-4">
                <input type="text" placeholder="Project Name" className="w-full p-4 premium-card outline-none" value={formName} onChange={e => setFormName(e.target.value)} />
                <button onClick={handleCreateProject} className="w-full py-4 dark-green-bg text-white rounded-2xl font-bold gold-btn">ACTIVATE VAULT</button>
              </div>
            )}

            {isModalOpen === 'product' && (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                   <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-gold-primary p-1 bg-white">
                      <img src={formImage} className="w-full h-full object-cover rounded-2xl" />
                   </div>
                </div>
                <input type="text" placeholder="Product Title" className="w-full p-4 premium-card outline-none" value={formName} onChange={e => setFormName(e.target.value)} />
                <div className="flex gap-4">
                   <input type="number" placeholder="MRP" className="w-full p-4 premium-card outline-none" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
                   <input type="number" placeholder="Stock" className="w-full p-4 premium-card outline-none" value={formStock} onChange={e => setFormStock(e.target.value)} />
                </div>
                <button onClick={handleAddProduct} className="w-full py-4 bg-emerald-950 text-white rounded-2xl font-bold border-b-4 border-gold-primary">CONFIRM LISTING</button>
              </div>
            )}

            {isModalOpen === 'edit' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-bold mb-2">MODIFYING: {selectedProduct?.title || selectedProject?.name}</p>
                <input type="text" placeholder="Rename" className="w-full p-4 premium-card outline-none" value={formName} onChange={e => setFormName(e.target.value)} />
                {selectedProduct && <input type="number" placeholder="Price" className="w-full p-4 premium-card outline-none" value={formPrice} onChange={e => setFormPrice(e.target.value)} />}
                
                <div className="flex gap-3 pt-4">
                  <button onClick={handleDelete} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100">DELETE</button>
                  <button onClick={handleEditSave} className="flex-1 py-4 bg-emerald-950 text-white rounded-2xl font-bold gold-btn">SAVE CHANGES</button>
                </div>
              </div>
            )}

            {isModalOpen === 'file' && (
              <div className="space-y-6">
                <div className="p-8 border-2 border-dashed border-gold-primary/30 rounded-[32px] text-center bg-slate-50">
                  <input type="file" accept=".json" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const p = await importProjectFromFile(file);
                      setState(prev => ({ ...prev, projects: [...prev.projects, { ...p, id: Date.now().toString() }] }));
                      setIsModalOpen(null);
                    }
                  }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="font-bold text-emerald-950">Import Manager File</p>
                  <p className="text-[10px] text-slate-400 mt-1">TAP TO SELECT .JSON</p>
                </div>
                {state.projects.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 premium-card">
                    <span className="font-bold text-sm text-emerald-950">{p.name}</span>
                    <button onClick={() => exportProject(p)} className="text-[10px] font-bold text-gold-primary border border-gold-primary px-4 py-1.5 rounded-full">EXPORT</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
