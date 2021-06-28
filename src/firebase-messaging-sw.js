importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-analytics.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyCmTIkkPgO98K-FYWdRaUpYGsOwcnv5ayc",
    authDomain: "prime-ac52f.firebaseapp.com",
    databaseURL: "https://prime-ac52f.firebaseio.com",
    projectId: "prime-ac52f",
    storageBucket: "prime-ac52f.appspot.com",
    messagingSenderId: "315479184528",
    appId: "1:315479184528:web:5acaf5ce1438d7d5383415",
    measurementId: "G-NQKKQQVV11"
});
const messaging = firebase.messaging();