class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function buildFrequencyTable(data) {
  const freq = new Map();
  for (const char of data) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  return freq;
}

function buildHuffmanTree(freq) {
  const nodes = [];
  for (const [char, count] of freq.entries()) {
    nodes.push(new HuffmanNode(char, count));
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const node = new HuffmanNode(null, left.freq + right.freq);
    node.left = left;
    node.right = right;
    nodes.push(node);
  }

  return nodes[0];
}

function buildCodeMap(node, prefix = '', codeMap = new Map()) {
  if (node.char !== null) {
    codeMap.set(node.char, prefix);
    return codeMap;
  }
  buildCodeMap(node.left, prefix + '0', codeMap);
  buildCodeMap(node.right, prefix + '1', codeMap);
  return codeMap;
}

export function compress(data) {
  if (!data || data.length === 0) return { compressed: null, tree: null };
  
  const freq = buildFrequencyTable(data);
  if (freq.size === 0) return { compressed: null, tree: null };
  
  const tree = buildHuffmanTree(freq);
  const codeMap = buildCodeMap(tree);
  
  let compressed = '';
  for (const char of data) {
    compressed += codeMap.get(char);
  }
  
  // Convert binary string to Uint8Array
  const bytes = [];
  for (let i = 0; i < compressed.length; i += 8) {
    const byte = compressed.substr(i, 8);
    bytes.push(parseInt(byte.padEnd(8, '0'), 2));
  }
  
  return {
    compressed: new Uint8Array(bytes),
    tree: JSON.stringify(serializeTree(tree)),
    originalSize: data.length * 8, // in bits
    compressedSize: compressed.length,
    padding: (8 - (compressed.length % 8)) % 8
  };
}

function traverseTree(node, result = []) {
  if (!node) return result;
  
  if (node.char !== null) {
    result.push({ char: node.char, freq: node.freq });
    return result;
  }
  
  result.push({ type: 'internal' });
  traverseTree(node.left, result);
  traverseTree(node.right, result);
  
  return result;
}

function serializeTree(node) {
  if (!node) return null;
  
  const serialized = {
    char: node.char,
    freq: node.freq,
    left: null,
    right: null
  };
  
  if (node.left) {
    serialized.left = serializeTree(node.left);
  }
  
  if (node.right) {
    serialized.right = serializeTree(node.right);
  }
  
  return serialized;
}

export function decompress(compressedData, serializedTree) {
  if (!compressedData || !serializedTree) return null;
  
  const tree = deserializeTree(JSON.parse(serializedTree));
  
  // Convert Uint8Array back to binary string
  let binaryString = '';
  for (const byte of compressedData) {
    binaryString += byte.toString(2).padStart(8, '0');
  }
  
  // Remove padding if any
  if (compressedData.padding) {
    binaryString = binaryString.slice(0, -compressedData.padding);
  }
  
  let result = '';
  let currentNode = tree;
  
  for (const bit of binaryString) {
    if (bit === '0') {
      currentNode = currentNode.left;
    } else {
      currentNode = currentNode.right;
    }
    
    if (currentNode.char !== null) {
      result += currentNode.char;
      currentNode = tree;
    }
  }
  
  return result;
}

function deserializeTree(data) {
  if (!data) return null;
  
  const node = new HuffmanNode(data.char, data.freq);
  
  if (data.left) {
    node.left = deserializeTree(data.left);
  }
  
  if (data.right) {
    node.right = deserializeTree(data.right);
  }
  
  return node;
}

export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
