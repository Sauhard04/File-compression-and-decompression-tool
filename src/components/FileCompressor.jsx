import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { toast } from 'react-toastify';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { compress } from '../utils/huffman';

const FileCompressor = () => {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);


  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setCompressedFile(null);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '*/*',
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB max file size
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsLoading(true);
    setProgress(20);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const data = String.fromCharCode.apply(null, uint8Array);
      setProgress(50);
      const result = compress(data);
      const blob = new Blob([result.compressed], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setCompressedFile({
        name: `${file.name}.huff`,
        url,
        originalSize: file.size,
        compressedSize: result.compressed.length,
        tree: result.tree,
        padding: result.padding
      });
      setProgress(100);
      toast.success('File compressed successfully!');
    } catch (error) {
      toast.error('Error during compression: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const a = document.createElement('a');
    a.href = compressedFile.url;
    a.download = compressedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Also download the tree data as a separate file
    const treeBlob = new Blob([compressedFile.tree], { type: 'application/json' });
    const treeUrl = URL.createObjectURL(treeBlob);
    const treeLink = document.createElement('a');
    treeLink.href = treeUrl;
    treeLink.download = `${file.name}.tree.json`;
    document.body.appendChild(treeLink);
    treeLink.click();
    document.body.removeChild(treeLink);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = compressedFile
    ? ((1 - (compressedFile.compressedSize / compressedFile.originalSize)) * 100).toFixed(2)
    : 0;

  return (
    <div className="compressor-root">
      <div className="card">
        <div className="card-header">Upload File</div>
        <div className="card-body">
          <div
            {...getRootProps()}
            className={`dropzone${isDragActive ? ' active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <FiUpload size={32} color="#3182ce" />
              {isLoading && (
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }} />
                </div>
              )}
              {!isLoading && (
                <>
                  <div>Drag & drop a file here, or click to select</div>
                  <div className="hint">Max file size: 10MB</div>
                </>
              )}
            </div>
          </div>
          {file && (
            <div className="file-info">
              <div className="file-row">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                className="btn btn-blue"
                onClick={handleCompress}
                disabled={!file || isLoading}
              >
                {isLoading ? 'Compressing...' : 'Compress File'}
              </button>
            </div>
          )}
        </div>
      </div>
      {compressedFile && (
        <div className="card">
          <div className="card-header">Compression Results</div>
          <div className="card-body">
            <div className="results">
              <div className="result-row">
                <span>Original Size:</span>
                <span>{formatFileSize(compressedFile.originalSize)}</span>
              </div>
              <div className="result-row">
                <span>Compressed Size:</span>
                <span>{formatFileSize(compressedFile.compressedSize)}</span>
              </div>
              <div className="result-row">
                <span>Compression Ratio:</span>
                <span className={compressionRatio > 0 ? 'ratio-green' : 'ratio-red'}>
                  {compressionRatio > 0 ? `-${compressionRatio}%` : '0%'}
                </span>
              </div>
            </div>
            <button
              className="btn btn-green"
              onClick={handleDownload}
            >
              <FiDownload style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Download Compressed File
            </button>
            <div className="hint" style={{ marginTop: 8 }}>
              The download includes the compressed file and a .tree.json file for decompression.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileCompressor;
