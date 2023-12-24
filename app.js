import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpDQFUKNXYeaLhT01xZ59_VhC_HSrnCFE",
  authDomain: "smit-1st-hackathon.firebaseapp.com",
  projectId: "smit-1st-hackathon",
  storageBucket: "smit-1st-hackathon.appspot.com",
  messagingSenderId: "521075458959",
  appId: "1:521075458959:web:ca8ff3a76cf7f1a05381fa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    getCurrentUserBlogs();
    getAllPost();
    getUid();
    // document.getElementById("goToLogin").style.display = "none";
  } else {
    // User is signed out
    getAllPost();

    document.getElementById("goToLogin").style.display = "block";
  }
});

const signup = () => {
  const userName = document.getElementById("sign-up-name").value;
  const userEmail = document.getElementById("sign-up-email").value;
  const userPassword = document.getElementById("sign-up-password").value;

  createUserWithEmailAndPassword(auth, userEmail, userPassword)
    .then(async (userCredential) => {
      // Signed up
      const user = userCredential.user;
      const userUid = user.uid;
      console.log(userUid);

      const userdetails = {
        name: userName,
        email: userEmail,
        password: userPassword,
        uid: userUid,
      };

      console.log(userdetails);

      await set(ref(database, `Auth/${auth.currentUser.uid}`), userdetails);

      const uidref = ref(database, `UID's/`);
      const updateUidRef = push(uidref);
      await set(updateUidRef, userUid);

      location.href = "../Blogs/allBlogs.html";
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
};

const login = () => {
  const userName = document.getElementById("login-name");
  const userEmail = document.getElementById("login-email");
  const userPassword = document.getElementById("login-password");

  const user = {
    name: userName.value,
    email: userEmail.value,
    password: userPassword.value,
  };
  console.log(user);

  signInWithEmailAndPassword(auth, userEmail.value, userPassword.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;

      // ...

      Swal.fire({
        position: "top-100px",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });

      location.href = "../Blogs/currentUserBlog.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
};

const logOut = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      console.log("Signout Successfully");
      Swal.fire({
        position: "top",
        icon: "success",
        title: "Logout Successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      location.pathname = "./index.html";
    })

    .catch((error) => {
      // An error happened.
    });
};

const useerId = [];
const getUid = () => {
  onValue(ref(database, `UID's/`), (snapshot) => {
    snapshot.forEach((childSnapShot) => {
      const data = childSnapShot.val();
      useerId.push(data);
    });
  });
};

// console.log(useerId);

const postBlog = async () => {
  if (auth.currentUser) {
    onValue(ref(database, `Auth/${auth.currentUser.uid}`), async (snapshot) => {
      const { name, email, password, uid } = snapshot.val();
      console.log(uid);

      const postBlogvalue = document.getElementById("postBlog").value;
      const blogTitle = document.getElementById("blogTitle").value;
      console.log(postBlogvalue);

      // Adding Current User Blogs In DataBase
      const postRef = ref(database, `Current-User-Post/${uid}`);
      const updatePostRef = push(postRef);
      await set(updatePostRef, {
        name: name,
        email: email,
        title: blogTitle,
        blog: postBlogvalue,
        createdAt: new Date().toLocaleDateString(),
      });

      document.getElementById("postBlog").value = null;
      document.getElementById("blogTitle").value = null;
      location.href = "../Blogs/currentUserBlog.html";
    });
  } else {
    alert("Dafa hojao");
  }
};

const getCurrentUserBlogs = () => {
  const currentUserBlogContainer = document.getElementById(
    "currentUserBlogContainer"
  );
  // currentUserBlogContainer.innerHTML = null;
  const postRef = ref(database, `Current-User-Post/${auth.currentUser.uid}`);
  onValue(postRef, (snapshot) => {
    const isDataExist = snapshot.exists();
    if (isDataExist) {
      snapshot.forEach((childSnapShot) => {
        const dataKey = childSnapShot.key;
        const dataValue = childSnapShot.val();
        const { blog, createdAt, email, name, title } = dataValue;

        const blogsCard = `
<section class="text-gray-600 border-2 rounded-lg body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
        <div class="-my-8 divide-y-2 divide-gray-100">
            <div class="py-8 flex flex-wrap md:flex-nowrap">
                <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                    <span class="font-semibold title-font text-gray-700">${name}</span>
                    <span class="font-semibold title-font text-gray-700">${email}</span>
                    <span class="mt-1 text-gray-500 text-sm">${createdAt}</span>
                </div>
                <div class="md:flex-grow">
                    <h2 class="text-2xl font-medium text-gray-900 title-font mb-2">${title}</h2>
                    <p class="leading-relaxed">${blog}</p>
                    
        </div>
        
                </div>
                 <button onclick="deleteCurrent(this)"
                   id=${dataKey}
         class="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Delete</button>
            </div>
        </div>
    </div>
</section>  
        `;
        const currentUserBlogContainer = document.getElementById(
          "currentUserBlogContainer"
        );
        currentUserBlogContainer.innerHTML += blogsCard;
      });
    }
  });
};

const getAllPost = () => {
  onValue(ref(database, `UID's/`), (snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapShot) => {
        const id = childSnapShot.val();
        console.log(id);
        onValue(ref(database, `Current-User-Post/${id}`), (snapshot) => {
          const isDataExist = snapshot.val();
          if (isDataExist) {
            snapshot.forEach((childSnapShot) => {
              const { blog, createdAt, email, name, title } =
                childSnapShot.val();

              console.log(blog);

              const blogsCard = `
<section class="text-gray-600 border-2 rounded-lg body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
        <div class="-my-8 divide-y-2 divide-gray-100">
            <div class="py-8 flex flex-wrap md:flex-nowrap">
                <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                    <span class="font-semibold title-font text-gray-700">${name}</span>
                    <span class="font-semibold title-font text-gray-700">${email}</span>
                    <span class="mt-1 text-gray-500 text-sm">${createdAt}</span>
                </div>
                <div class="md:flex-grow">
                    <h2 class="text-2xl font-medium text-gray-900 title-font mb-2">${title}</h2>
                    <p class="leading-relaxed">${blog}</p>
                    
        </div>
                </div>
            </div>
        </div>
    </div>
</section>  
        `;

              const allBlogContainer =
                document.getElementById("allBlogContainer");
              allBlogContainer.innerHTML += blogsCard;
            });
          }
        });
      });
    }
  });
};

const deleteCurrent = (btn) => {
  const elemntID = btn.id;
  const postRef = ref(
    database,
    `Current-User-Post/${auth.currentUser.uid}/${elemntID}`
  );
  remove(postRef);
  document.getElementById("currentUserBlogContainer").innerHTML = null;
  getCurrentUserBlogs();
};
window.signup = signup;
window.login = login;
window.logOut = logOut;
window.postBlog = postBlog;
window.deleteCurrent = deleteCurrent;
