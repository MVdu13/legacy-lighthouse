
import React, { useState } from 'react';
import { BarChart3, ArrowUpRight, ArrowDownRight, ExternalLink, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Asset, AssetType } from '@/types/assets';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import RealEstateDetailsDialog from './RealEstateDetailsDialog';

interface GroupedAssetsListProps {
  groupedAssets: Record<AssetType, Asset[]>;
  navigateTo: (item: string) => void;
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  hideInvestmentAccounts?: boolean;
}

const GroupedAssetsList: React.FC<GroupedAssetsListProps> = ({
  groupedAssets,
  navigateTo,
  onEdit,
  onDelete,
  hideInvestmentAccounts = false
}) => {
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'bank-account': true,
    'savings-account': true,
    'real-estate': true,
    'stock': true,
    'crypto': true
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete && onDelete) {
      onDelete(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setAssetToDelete(null);
  };

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAssetClick = (asset: Asset) => {
    if (asset.type === 'real-estate') {
      setSelectedAsset(asset);
      setDetailsDialogOpen(true);
    }
  };

  const getSectionName = (type: string): string => {
    switch (type) {
      case 'bank-account': return 'Comptes bancaires';
      case 'savings-account': return 'Livrets d\'épargne';
      case 'real-estate': return 'Immobilier';
      case 'stock': return 'Actions';
      case 'crypto': return 'Cryptomonnaies';
      case 'bonds': return 'Obligations';
      case 'cash': return 'Liquidités';
      case 'commodities': return 'Matières premières';
      default: return 'Autres actifs';
    }
  };

  const getNavigationTarget = (type: string): string => {
    switch (type) {
      case 'bank-account': return 'bank-accounts';
      case 'savings-account': return 'savings-accounts';
      case 'real-estate': return 'real-estate';
      case 'stock': return 'stocks';
      case 'crypto': return 'crypto';
      default: return 'assets';
    }
  };

  // Filter out investment and crypto accounts if hideInvestmentAccounts is true
  const filteredTypes = Object.keys(groupedAssets).filter(type => {
    if (hideInvestmentAccounts) {
      return type !== 'investment-account' && type !== 'crypto-account';
    }
    return true;
  });

  const orderedTypes = filteredTypes.sort((a, b) => {
    const order = {
      'bank-account': 1,
      'savings-account': 2,
      'real-estate': 3,
      'stock': 4,
      'crypto': 5,
      'bonds': 6,
      'cash': 7,
      'commodities': 8,
      'other': 9
    };
    return (order[a as keyof typeof order] || 10) - (order[b as keyof typeof order] || 10);
  });

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-medium text-lg">Actifs principaux</h3>
        <button className="p-2 rounded-md hover:bg-muted transition-colors">
          <BarChart3 size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-grow">
        {orderedTypes.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Aucun actif dans votre patrimoine
          </div>
        ) : (
          <div className="space-y-6">
            {orderedTypes.map(type => {
              const assets = groupedAssets[type as AssetType];
              if (!assets || assets.length === 0) return null;
              
              const sectionTotal = assets.reduce((sum, asset) => sum + asset.value, 0);
              
              return (
                <div key={type} className="space-y-2">
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-muted rounded-md p-2"
                    onClick={() => toggleSection(type)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections[type] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <h4 className="font-medium">{getSectionName(type)}</h4>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(sectionTotal)}</span>
                  </div>
                  
                  {expandedSections[type] && (
                    <div className="space-y-2 pl-6">
                      {assets.map(asset => (
                        <div 
                          key={asset.id} 
                          className="p-3 rounded-lg border border-border hover:border-wealth-primary/20 transition-all hover:shadow-sm cursor-pointer"
                          onClick={() => handleAssetClick(asset)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-md flex items-center justify-center",
                                asset.type === 'stock' ? "bg-blue-100" : 
                                asset.type === 'crypto' ? "bg-purple-100" : 
                                asset.type === 'real-estate' ? "bg-green-100" : 
                                asset.type === 'cash' ? "bg-gray-100" : 
                                asset.type === 'bank-account' ? "bg-blue-100" :
                                asset.type === 'savings-account' ? "bg-violet-100" :
                                "bg-orange-100"
                              )}>
                                <span className="font-medium text-sm">
                                  {asset.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{asset.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {asset.description}
                                </p>
                                {asset.type === 'stock' && asset.quantity && asset.purchasePrice && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {asset.quantity} × {formatCurrency(asset.purchasePrice)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(asset.value)}</p>
                              {asset.performance !== undefined && (
                                <p className={cn(
                                  "text-xs flex items-center justify-end gap-1",
                                  asset.performance >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                  {asset.performance >= 0 ? (
                                    <ArrowUpRight size={14} />
                                  ) : (
                                    <ArrowDownRight size={14} />
                                  )}
                                  {asset.performance > 0 ? "+" : ""}{asset.performance}%
                                </p>
                              )}
                            </div>
                          </div>

                          {(onEdit || onDelete) && (
                            <div className="mt-3 pt-3 border-t border-border flex justify-end gap-2">
                              {onEdit && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(asset);
                                  }} 
                                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-wealth-primary"
                                  title="Modifier"
                                >
                                  <Pencil size={16} />
                                </button>
                              )}
                              {onDelete && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(asset);
                                  }} 
                                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {expandedSections[type] && (
                    <button 
                      className="text-sm text-wealth-primary font-medium pl-6 flex items-center gap-1 hover:underline"
                      onClick={() => navigateTo(getNavigationTarget(type))}
                    >
                      <span>Voir tous les {getSectionName(type).toLowerCase()}</span>
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmationDialog 
        isOpen={!!assetToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        assetName={assetToDelete?.name}
      />

      <RealEstateDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        property={selectedAsset}
      />
    </div>
  );
};

export default GroupedAssetsList;
