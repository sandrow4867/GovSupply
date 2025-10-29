import React, {useCallback} from 'react';
import { UploadIcon } from '../icons/UploadIcon';
import { useLanguage } from '../../contexts/LanguageContext';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileSelect(files);
    }
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      onFileSelect(event.dataTransfer.files);
    }
  }, [onFileSelect]);
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
      <div 
        className="flex justify-center px-6 pt-5 pb-6 border-2 border-medium-gray/40 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors dark:border-medium-gray/60 dark:hover:border-primary"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="space-y-1 text-center">
          <UploadIcon className="mx-auto h-12 w-12 text-medium-gray" />
          <div className="flex text-sm text-navy dark:text-light-gray">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary"
            >
              <span>{t('fileUpload.upload')}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
            </label>
            <p className="pl-1">{t('fileUpload.drag')}</p>
          </div>
          <p className="text-xs text-medium-gray">{t('fileUpload.types')}</p>
        </div>
      </div>
  );
};