import { collection, getCountFromServer } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

export async function getCollectionCount(collectionName) {
  const colRef = collection(firestore, collectionName);
  const snapshot = await getCountFromServer(colRef);
  return snapshot.data().count;
}
