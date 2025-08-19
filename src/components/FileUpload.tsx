import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '../utils/helpers';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'relative border-2 border-dashed text-center transition-colors duration-200',
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400',
          isLoading && 'opacity-50 pointer-events-none',
          'p-[25px] rounded-[10px]',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json,application/json"
          onChange={handleChange}
          className="absolute top-[0] left-[0] w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isLoading ? '正在處理檔案...' : '上傳SAST報告'}
            </h3>
            <p className="text-sm text-gray-500">
              拖拽JSON檔案到這裡，或點擊選擇檔案
            </p>
            <p className="text-xs text-gray-400 mt-1">
              支援的格式：.json
            </p>
          </div>
          
          {!isLoading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>SAST JSON 報告檔案</span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-danger-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-danger-800 mb-1">檔案處理錯誤</h4>
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
