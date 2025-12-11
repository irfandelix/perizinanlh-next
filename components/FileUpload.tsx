'use client';

import { useState } from 'react';

interface FileUploadProps {
  noUrut: number;
  fileType: string;
  dbField: string;
  currentFileUrl?: string;
  namaKegiatan: string;
  onUploadSuccess: () => void;
}

export default function FileUpload({ noUrut, fileType, dbField, currentFileUrl, namaKegiatan, onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('noUrut', noUrut.toString());
    formData.append('fileType', fileType);
    formData.append('dbField', dbField);
    formData.append('namaKegiatan', namaKegiatan);

    setUploading(true);

    try {
      const res = await fetch('/api/dokumen/upload-drive', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('Upload Berhasil!');
        onUploadSuccess();
      } else {
        alert('Gagal Upload: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-start gap-2">
      <span className="text-sm font-semibold text-gray-700">File {fileType}:</span>
      
      {currentFileUrl ? (
        <div className="flex items-center gap-3">
          <a 
            href={currentFileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm hover:text-blue-800"
          >
            Lihat File Tersimpan
          </a>
          <span className="text-gray-400 text-xs">|</span>
          <label className="cursor-pointer text-xs text-orange-600 font-bold hover:text-orange-700">
            Ganti File
            <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>
      ) : (
        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition shadow-sm">
          {uploading ? 'Mengupload...' : 'Pilih File PDF'}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept=".pdf" />
        </label>
      )}
      
      {uploading && <div className="w-full h-1 bg-gray-200 rounded overflow-hidden"><div className="h-full bg-blue-500 animate-pulse"></div></div>}
    </div>
  );
}