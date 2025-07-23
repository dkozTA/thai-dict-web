import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { firestore } from "./firebase";

// Search for Thai words in Firestore
export const searchThaiWords = async (searchTerm) => {
  try {
    if (!searchTerm.trim()) return [];

    const wordsRef = collection(firestore, "dictionary");
    
    // Search by Thai word (exact match first, then partial match)
    const exactQuery = query(
      wordsRef,
      where("word", "==", searchTerm.toLowerCase()),
      limit(10)
    );
    
    const partialQuery = query(
      wordsRef,
      where("word", ">=", searchTerm.toLowerCase()),
      where("word", "<=", searchTerm.toLowerCase() + "\uf8ff"),
      orderBy("word"),
      limit(10)
    );

    const [exactResults, partialResults] = await Promise.all([
      getDocs(exactQuery),
      getDocs(partialQuery)
    ]);

    const results = [];
    
    // Add exact matches first
    exactResults.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    // Add partial matches (avoid duplicates)
    partialResults.forEach((doc) => {
      const existingItem = results.find(item => item.id === doc.id);
      if (!existingItem) {
        results.push({ id: doc.id, ...doc.data() });
      }
    });

    return results;
  } catch (error) {
    console.error("Error searching words:", error);
    throw error;
  }
};