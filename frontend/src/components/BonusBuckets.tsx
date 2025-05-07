import React from 'react';
import { DataTable, Column } from './common/DataTable';
import { FranchiseBonus } from '../types';
import '../styles/BonusBuckets.css';

interface Props {
  bonusStats: FranchiseBonus;
}

interface BonusRow {
  franchise: string;
  runs_25: number;
  runs_50: number;
  runs_75: number;
  runs_100: number;
  wickets_3: number;
  wickets_5: number;
  wickets_7: number;
  maidens: number;
  total: number;
}

export const BonusBuckets: React.FC<Props> = ({ bonusStats }) => {
  const rows: BonusRow[] = Object.entries(bonusStats).map(([franchise, stats]) => {
    const total = (stats.runs_25 * 10) + (stats.runs_50 * 20) + 
                 (stats.runs_75 * 30) + (stats.runs_100 * 40) +
                 (stats.wickets_3 * 25) + (stats.wickets_5 * 50) + 
                 (stats.wickets_7 * 75) + (stats.maidens * 10);
    
    return {
      franchise: franchise === 'Unknown' ? 'UNSOLD' : franchise,
      ...stats,
      total
    };
  }).sort((a, b) => b.total - a.total);

  const columns: Column<BonusRow>[] = [
    { 
      id: 'franchise', 
      label: 'Franchise',
      className: 'franchise-column'
    },
    { 
      id: 'runs_25', 
      label: '25+ Runs', 
      align: 'right',
      className: 'runs-column'
    },
    { 
      id: 'runs_50', 
      label: '50+ Runs', 
      align: 'right',
      className: 'runs-column'
    },
    { 
      id: 'runs_75', 
      label: '75+ Runs', 
      align: 'right',
      className: 'runs-column'
    },
    { 
      id: 'runs_100', 
      label: '100+ Runs', 
      align: 'right',
      className: 'runs-column'
    },
    { 
      id: 'wickets_3', 
      label: '3+ Wickets', 
      align: 'right',
      className: 'wickets-column'
    },
    { 
      id: 'wickets_5', 
      label: '5+ Wickets', 
      align: 'right',
      className: 'wickets-column'
    },
    { 
      id: 'wickets_7', 
      label: '7+ Wickets', 
      align: 'right',
      className: 'wickets-column'
    },
    { 
      id: 'maidens', 
      label: 'Maidens', 
      align: 'right',
      className: 'maidens-column'
    },
    { 
      id: 'total', 
      label: 'Total Points', 
      align: 'right',
      className: 'total-column'
    },
  ];

  return (
    <div className="bonus-buckets">
      <DataTable<BonusRow>
        title="Bonus Points Distribution"
        columns={columns}
        data={rows}
        getRowKey={(row) => row.franchise}
      />
    </div>
  );
};