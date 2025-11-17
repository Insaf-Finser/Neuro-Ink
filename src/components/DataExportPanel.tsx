// Data Export Panel Component
// Provides comprehensive data export functionality for assessment results

import React, { useState } from 'react';
import styled from 'styled-components';
import { Download, FileText, FileSpreadsheet, Database, Trash2, AlertTriangle } from 'lucide-react';
import { useTaskCompletion } from '../hooks/useTaskCompletion';

const ExportPanel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const PanelTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ExportOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ExportButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #3b82f6;
          color: white;
          &:hover {
            background: #2563eb;
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background: #e5e7eb;
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
    }
  }}

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const WarningSection = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const WarningTitle = styled.div`
  font-weight: 600;
  color: #92400e;
`;

const WarningText = styled.div`
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
`;

const DataExportPanel: React.FC = () => {
  const { exportSessions, clearCompletedSessions, getCompletionStats } = useTaskCompletion();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearWarning, setShowClearWarning] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const blob = await exportSessions('json');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const blob = await exportSessions('csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (!showClearWarning) {
      setShowClearWarning(true);
      return;
    }

    if (!window.confirm('Are you sure you want to delete all completed assessment data? This action cannot be undone.')) {
      setShowClearWarning(false);
      return;
    }

    setIsClearing(true);
    try {
      await clearCompletedSessions();
      window.alert('All completed assessment data has been deleted.');
      setShowClearWarning(false);
    } catch (error) {
      console.error('Clear failed:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <ExportPanel>
      <PanelHeader>
        <Database size={24} color="#667eea" />
        <PanelTitle>Data Management</PanelTitle>
      </PanelHeader>

      {showClearWarning && (
        <WarningSection>
          <WarningHeader>
            <AlertTriangle size={16} />
            <WarningTitle>Warning: Data Deletion</WarningTitle>
          </WarningHeader>
          <WarningText>
            This will permanently delete all completed assessment data. This action cannot be undone.
            Make sure you have exported your data before proceeding.
          </WarningText>
        </WarningSection>
      )}

      <ExportOptions>
        <ExportButton $variant="primary" onClick={handleExportJSON} disabled={isExporting}>
          <FileText size={16} />
          {isExporting ? 'Exporting...' : 'Export JSON'}
        </ExportButton>

        <ExportButton $variant="primary" onClick={handleExportCSV} disabled={isExporting}>
          <FileSpreadsheet size={16} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </ExportButton>

        <ExportButton 
          $variant={showClearWarning ? 'danger' : 'secondary'} 
          onClick={handleClearData} 
          disabled={isClearing}
        >
          <Trash2 size={16} />
          {isClearing ? 'Clearing...' : showClearWarning ? 'Confirm Delete' : 'Clear All Data'}
        </ExportButton>
      </ExportOptions>
    </ExportPanel>
  );
};

export default DataExportPanel;
