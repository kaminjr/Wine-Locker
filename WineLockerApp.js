const WineLockerApp = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [wines, setWines] = useState(() => {
    const saved = localStorage.getItem('wineLocker_wines');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Château Margaux 2015",
        type: "Red Wine",
        region: "Bordeaux, France",
        vintage: 2015,
        quantity: 2,
        value: 850,
        notes: "Special occasion wine - anniversary",
        rating: 4.8,
        photo: null,
        addedDate: "2024-01-15"
      },
      {
        id: 2,
        name: "Dom Pérignon 2012",
        type: "Champagne",
        region: "Champagne, France",
        vintage: 2012,
        quantity: 1,
        value: 200,
        notes: "Perfect for celebrations",
        rating: 4.9,
        photo: null,
        addedDate: "2024-02-10"
      }
    ];
  });
  const [showAddWine, setShowAddWine] = useState(false);
  const [newWine, setNewWine] = useState({
    name: '',
    type: 'Red Wine',
    region: '',
    vintage: new Date().getFullYear(),
    quantity: 1,
    value: '',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('wineLocker_wines', JSON.stringify(wines));
  }, [wines]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const totalValue = wines.reduce((sum, wine) => sum + (wine.value * wine.quantity), 0);
  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);

  const addWine = () => {
    if (newWine.name && newWine.region) {
      const wine = {
        ...newWine,
        id: Date.now(),
        value: parseFloat(newWine.value) || 0,
        rating: 0,
        photo: null,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setWines([wine, ...wines]);
      setNewWine({
        name: '',
        type: 'Red Wine',
        region: '',
        vintage: new Date().getFullYear(),
        quantity: 1,
        value: '',
        notes: ''
      });
      setShowAddWine(false);
    }
  };

  // NEW: Delete wine function
  const deleteWine = (id) => {
    if (window.confirm("Are you sure you want to delete this wine?")) {
      setWines(wines.filter(w => w.id !== id));
    }
  };

  // Pass deleteWine as a prop to WineCard
  const WineCard = ({ wine, onDelete }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800">{wine.name}</h3>
          <p className="text-gray-600 text-sm">{wine.region} • {wine.vintage}</p>
          <p className="text-gray-500 text-sm">{wine.type}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">${wine.value}</p>
          <p className="text-sm text-gray-500">Qty: {wine.quantity}</p>
        </div>
      </div>
      {wine.rating > 0 && (
        <div className="flex items-center mb-2">
          <span className="h-4 w-4 text-yellow-400">★</span>
          <span className="ml-1 text-sm text-gray-600">{wine.rating}</span>
        </div>
      )}
      {wine.notes && (
        <p className="text-sm text-gray-600 italic mb-2">{wine.notes}</p>
      )}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Added {wine.addedDate}</span>
        {/* Delete Button */}
        <button
          onClick={() => onDelete(wine.id)}
          className="text-red-600 text-xs font-semibold hover:underline ml-4"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // ...rest of your code (AddWineForm, InventoryTab, etc.)
  // In InventoryTab, pass deleteWine to WineCard:
  const InventoryTab = () => (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wine Locker</h1>
        <button
          onClick={() => setShowAddWine(true)}
          className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 shadow-lg"
        >
          <Plus />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Value</p>
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">Total Bottles</p>
          <p className="text-2xl font-bold">{totalBottles}</p>
        </div>
      </div>
      <div>
        {wines.map(wine => (
          <WineCard key={wine.id} wine={wine} onDelete={deleteWine} />
        ))}
      </div>
    </div>
  );

  // ...rest of component (render, AddWineForm, etc.)
};