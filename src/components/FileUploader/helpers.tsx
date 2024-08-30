import CryptoJS from 'crypto-js';

export const MAX_CHUNK_SIZE = 1048576 * 2; // MB

export const BATCH_SIZE = 5;

export const MAX_RETRY_COUNT = 3;

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
  chunks: Chunk[];
  checksum: string;
  error?: string;
  completed?: boolean;
  failed?: boolean;
  file: File;
};

const createChanceOfFailure = (chance: number) => chance <= Math.random();

// This simulates api call time
export const callAPI = (callback: () => void, chanceOfSuccess = 1): Promise<void> =>
  new Promise((resolved, reject) => {
    if (createChanceOfFailure(chanceOfSuccess)) {
      return reject('Something went wrong!');
    }
    return setTimeout(() => resolved(callback()), 500);
  });
