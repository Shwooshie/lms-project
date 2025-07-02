import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}