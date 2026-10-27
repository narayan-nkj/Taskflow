import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { importTasksFromJsonFile } from '../../services/importExport';
import { UploadCloud, FileText, AlertCircle, ArrowRight } from 'lucide-react';

export const ImportModal = ({
  isOpen,
  onClose,
  existingTasks,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleReset = () => {
    setSelectedFile(null);
    setIsValidating(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsValidating(true);
    setErrorMessage(null);

    const result = await importTasksFromJsonFile(selectedFile, existingTasks);
    setIsValidating(false);

    if (result.success) {
      onImportSuccess(result);
      handleReset();
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to import tasks.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Import Tasks from JSON"
      description="Upload a TaskFlow JSON backup file to merge tasks into your workspace."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Format Guidance */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#292929] text-xs text-slate-600 dark:text-[#B0B0B0] space-y-1.5">
          <p className="font-semibold text-charcoal-900 dark:text-[#F5F5F5]">
            Supported File Formats:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-[#808080]">
            <li>TaskFlow backup format: <code className="font-mono text-[11px] text-brand-600 dark:text-brand-400">taskflow-tasks-*.json</code> with <code className="font-mono text-[11px]">schemaVersion: 1</code></li>
            <li>Raw JSON task array: <code className="font-mono text-[11px]">[&#123; id, title, priority, category, dueDate, status &#125;]</code></li>
            <li>Safe merge policy: Existing tasks are never deleted. Duplicate IDs are automatically assigned fresh unique IDs.</li>
          </ul>
        </div>

        {/* File Drop / Select Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-brand-500 bg-brand-50/20 dark:bg-[#24140E]'
              : 'border-slate-300 dark:border-[#292929] hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50/50 dark:hover:bg-[#181818]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload JSON file"
          />

          <div className="w-12 h-12 rounded-2xl bg-peach-100 dark:bg-[#24140E] text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-3">
            {selectedFile ? (
              <FileText className="w-6 h-6" aria-hidden="true" />
            ) : (
              <UploadCloud className="w-6 h-6" aria-hidden="true" />
            )}
          </div>

          {selectedFile ? (
            <div>
              <p className="text-sm font-semibold text-charcoal-900 dark:text-[#F5F5F5]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-[#808080] mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose another file
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-[#F5F5F5]">
                Click to browse or choose a JSON file
              </p>
              <p className="text-xs text-slate-400 dark:text-[#808080] mt-1">
                JSON files only (max 5MB)
              </p>
            </div>
          )}
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-semibold">Import rejected (All-or-Nothing policy):</span>
              <p>{errorMessage}</p>
              <p className="text-[11px] opacity-90 mt-1">
                Your current task list has not been modified.
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-[#292929]">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#F5F5F5] bg-slate-100 dark:bg-[#181818] hover:bg-slate-200 dark:hover:bg-[#202020] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 border border-slate-200/60 dark:border-[#292929]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!selectedFile || isValidating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-sm shadow-brand-500/30 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {isValidating ? (
              'Validating File...'
            ) : (
              <>
                Import & Merge
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
