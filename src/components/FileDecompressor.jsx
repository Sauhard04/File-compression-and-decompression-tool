import { useState } from 'react';
import { toast } from 'react-toastify';
import { decompress, base64ToArrayBuffer } from '../utils/huffman';

const FileDecompressor = () => {
  const [compressedFile, setCompressedFile] = useState(null);
  const [treeFile, setTreeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [decompressedFile, setDecompressedFile] = useState(null);

  const handleCompressedFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.huff')) {
      setCompressedFile(file);
    } else {
      toast.error('Please upload a .huff file');
      setCompressedFile(null);
    }
    setDecompressedFile(null);
  };

  const handleTreeFileChange = (e) => {
    setTreeFile(e.target.files[0]);
    setDecompressedFile(null);
  };

  const handleDecompress = async () => {
    if (!compressedFile || !treeFile) {
      toast.error('Please upload both .huff and .tree.json files');
      return;
    }
    setIsLoading(true);
    try {
      const compressedBuffer = await compressedFile.arrayBuffer();
      const treeText = await treeFile.text();
      const compressedData = new Uint8Array(compressedBuffer);
      const originalText = decompress(compressedData, treeText);
      const blob = new Blob([originalText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setDecompressedFile({
        name: compressedFile.name.replace(/\.huff$/, '.decompressed.txt'),
        url
      });
      toast.success('File decompressed successfully!');
    } catch (error) {
      toast.error('Error during decompression: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!decompressedFile) return;
    const a = document.createElement('a');
    a.href = decompressedFile.url;
    a.download = decompressedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="compressor-root">
      <div className="card">
        <div className="card-header">Decompress File</div>
        <div className="card-body">
          <div style={{ marginBottom: 16 }}>
            <label className="hint">Compressed (.huff) file</label>
            <input
              type="file"
              accept=".huff"
              onChange={handleCompressedFileChange}
              style={{ display: 'block', marginBottom: 12 }}
            />
            <label className="hint">Tree (.tree.json) file</label>
            <input
              type="file"
              accept=".json"
              onChange={handleTreeFileChange}
              style={{ display: 'block', marginBottom: 12 }}
            />
          </div>
          <button
            className="btn btn-blue"
            onClick={handleDecompress}
            disabled={!compressedFile || !treeFile || isLoading}
          >
            {isLoading ? 'Decompressing...' : 'Decompress File'}
          </button>
          {isLoading && (
            <div className="hint" style={{ marginTop: 8 }}>Decompressing...</div>
          )}
          {decompressedFile && (
            <button
              className="btn btn-green"
              style={{ marginLeft: 12 }}
              onClick={handleDownload}
            >
              Download Decompressed File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDecompressor;
