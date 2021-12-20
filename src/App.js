import React, { useState, useRef } from "react";
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

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
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;

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
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return(
    <div className={ `message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )

}

export default App;
