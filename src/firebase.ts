import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCQhtAr4lMC-cMO1tvnfxsSShB8Pc1mSXI",
    authDomain: "simplifiedgame.firebaseapp.com",
    projectId: "simplifiedgame",
    storageBucket: "simplifiedgame.firebasestorage.app",
    messagingSenderId: "1057441447527",
    appId: "1:1057441447527:web:3de92118906b937c005ec2",
    measurementId: "G-NEERHT96QX"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 