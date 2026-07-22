import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("register-form");

    const errorBox = document.getElementById("register-error");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        const confirm = document.getElementById("confirmPassword").value;

        errorBox.textContent = "";

        if(password !== confirm){
            errorBox.textContent="Las contraseñas no coinciden.";
            return;
        }

        try{

            const cred = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await updateProfile(cred.user,{
                displayName:name
            });

            await setDoc(
                doc(db,"users",cred.user.uid),
                {
                    nombre:name,
                    email:email,
                    rol:"cliente",
                    creado:new Date()
                }
            );

            window.location.href="perfil.html";

        }catch(error){

            errorBox.textContent=error.message;

        }

    });

});
