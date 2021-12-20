import React, { useState, useRef } from "react";
import './App.css';


import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
var CryptoJS = require("crypto-js");

firebase.initializeApp({
  apiKey: "AIzaSyBZGy--btJtgBsbgq55JfHW1w8NF0VzlnE",
  authDomain: "v-chat-95191.firebaseapp.com",
  projectId: "v-chat-95191",
  storageBucket: "v-chat-95191.appspot.com",
  messagingSenderId: "504480670740",
  appId: "1:504480670740:web:b6201a834d221e3bec3301"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const key = "ynsh67sduhd98dut78"

function encrypt(message = '', key = ''){
  message = CryptoJS.AES.encrypt(message, key);
  return message.toString();
}
function decrypt(message = '', key = ''){
  var code = CryptoJS.AES.decrypt(message, key);
  var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

  return decryptedMessage;
}

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
         V-CHAT
         {user? <SignOut />: <></>}
      </header>

      <section>
          {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignOut(){
  return(
    <button id = "signout" onClick={(e)=>{
      e.preventDefault();
      auth.signOut();
    }}>Sign Out</button>
  );
}

function SignIn(){
  const signout = document.getElementById("signout")
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  if(signout) 
  signout.style.display = "hidden";
  return(
    <button  id="signin" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}



function ChatRoom(){
  const dummy = useRef();
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);
  const[messages] = useCollectionData(query, {idField: 'id'});
  let [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    formValue = encrypt(formValue, key);

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  
  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
          <input placeholder = "Type a Message ..." value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
          <button type = 'submit'>Send</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  let {text, uid, photoURL} = props.message;
  text = decrypt(text, key);
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={ `message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )

}

export default App;
