const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyAFXXfL6Hfz1U_WRcu-yYXpGSClEAjwydE',
  authDomain: 'p-o-g-cf552.firebaseapp.com',
  projectId: 'p-o-g-cf552',
  storageBucket: 'p-o-g-cf552.appspot.com',
  messagingSenderId: '781545326974',
  appId: '1:781545326974:web:6ec65723b612b9a71d4b2f',
  measurementId: 'G-5K8SLC4FZT',
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

module.exports = { firebaseConfig, firebaseApp, firebaseAuth };
