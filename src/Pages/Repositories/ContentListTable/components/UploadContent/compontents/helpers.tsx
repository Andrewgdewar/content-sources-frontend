import CryptoJS from 'crypto-js';

const readSlice = (file: File, start: number, size: number): Promise<Uint8Array> =>
  new Promise<Uint8Array>((resolve, reject) => {
    const fileReader = new FileReader();
    const slice = file.slice(start, start + size);

    fileReader.onload = () => resolve(new Uint8Array(fileReader.result as ArrayBuffer));
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(slice);
  });

export const getFileChecksumSHA256 = async (file: File): Promise<string> => {
  let sha256 = CryptoJS.algo.SHA256.create();
  const sliceSize = 3_145_728; // 3 MiB
  let start = 0;

  while (start < file.size) {
    const slice: Uint8Array = await readSlice(file, start, sliceSize);
    const wordArray = CryptoJS.lib.WordArray.create(slice);
    sha256 = sha256.update(wordArray);
    start += sliceSize;
  }

  sha256.finalize();

  return sha256._hash.toString();
};

export type Chunk = {
  start: number;
  end: number;
  queued: boolean;
  completed: boolean;
  retryCount: number;
};

export type FileInfo = {
  uuid: string;
  created: string;
  chunks: Chunk[];
  checksum: string;
  error?: string;
  completed?: boolean;
  failed?: boolean;
  file: File;
};
