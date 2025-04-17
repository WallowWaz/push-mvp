// src/score.js
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function submitScore(username, score) {
  try {
    const docRef = await addDoc(collection(db, 'leaderboard'), {
      username,
      score,
      createdAt: serverTimestamp(),
    });
    console.log('Score submitted, id:', docRef.id);
  } catch (error) {
    console.error('Error writing score:', error);
  }
}

export async function fetchLeaderboard(topN = 10) {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'asc'),
    limit(topN)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}
