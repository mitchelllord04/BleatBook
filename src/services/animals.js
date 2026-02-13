import { db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

function animalsRef(uid) {
  return collection(db, "users", uid, "animals");
}

export async function addAnimal(uid, animal) {
  const ref = animalsRef(uid);
  const docRef = await addDoc(ref, {
    ...animal,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAnimals(uid) {
  const q = query(animalsRef(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAnimal(uid, animalId) {
  const ref = doc(db, "users", uid, "animals", animalId);

  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

export async function updateAnimal(uid, animalId, updates) {
  const ref = doc(db, "users", uid, "animals", animalId);

  const { id, ...data } = updates;

  await updateDoc(ref, data);
}

export async function deleteAnimal(uid, animalId) {
  const ref = doc(db, "users", uid, "animals", animalId);
  await deleteDoc(ref);
}
