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
  update,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    getCurrentUserBlogs();
    getAllPost();
    getUid();
  } else {
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
      const user = userCredential.user;
      const userUid = user.uid;

      const userImage = document.getElementById("user-image").files[0];
      const imageRef = storageRef(
        storage,
        `User-Image/${auth.currentUser.uid}`
      );
      await uploadBytes(imageRef, userImage).then((snapshot) => {
        getDownloadURL(imageRef).then(async (url) => {
          const userdetails = {
            name: userName,
            email: userEmail,
            password: userPassword,
            uid: userUid,
            ImageUrl: url,
          };

          await set(ref(database, `Auth/${auth.currentUser.uid}`), userdetails);

          const uidref = ref(database, `UID's/`);
          const updateUidRef = push(uidref);
          await set(updateUidRef, userUid);

          await Swal.fire({
            position: "top-100px",
            icon: "success",
            title: "Your work has been saved",
            showConfirmButton: false,
            timer: 1500,
          });

          location.href = "../Blogs/allBlogs.html";
        });
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
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
    .then(async (userCredential) => {
      const user = userCredential.user;

      await Swal.fire({
        position: "top-100px",
        icon: "success",
        title: "Sign In Successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      location.href = "../Blogs/currentUserBlog.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
    });
};

const logOut = () => {
  signOut(auth)
    .then(async () => {
      console.log("Signout Successfully");
      await Swal.fire({
        position: "top-100px",
        icon: "success",
        title: "Logout Successfully",
        showConfirmButton: false,
        timer: 3000,
      });
      location.pathname = "./index.html";
    })

    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
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

const postBlog = async () => {
  if (auth.currentUser) {
    onValue(ref(database, `Auth/${auth.currentUser.uid}`), async (snapshot) => {
      const { name, email, password, uid, ImageUrl } = snapshot.val();

      const postBlogvalue = document.getElementById("postBlog").value;
      const blogTitle = document.getElementById("blogTitle").value;

      const postRef = ref(database, `Current-User-Post/${uid}`);
      const updatePostRef = push(postRef);
      await set(updatePostRef, {
        name: name,
        email: email,
        title: blogTitle,
        blog: postBlogvalue,
        ImageUrl: ImageUrl,
        createdAt: new Date().toLocaleDateString(),
      });

      document.getElementById("postBlog").value = null;
      document.getElementById("blogTitle").value = null;

      let timerInterval;
      await Swal.fire({
        title: "Your Blog is ready to post",
        html: "Your Blog is posted in <b></b> milliseconds.",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log("I was closed by the timer");
        }
      });

      location.href = "../Blogs/currentUserBlog.html";
    });
  } else {
    await Swal.fire({
      icon: "error",
      title: "Authentication error",
      text: "Login First",
      footer: '<a href="../Auth/login.html">Click Here to Login</a>',
    });
  }
};

const getCurrentUserBlogs = () => {
  const currentUserBlogContainer = document.getElementById(
    "currentUserBlogContainer"
  );
  const postRef = ref(database, `Current-User-Post/${auth.currentUser.uid}`);
  onValue(postRef, (snapshot) => {
    const isDataExist = snapshot.exists();
    if (isDataExist) {
      snapshot.forEach((childSnapShot) => {
        const dataKey = childSnapShot.key;
        const dataValue = childSnapShot.val();
        const { blog, createdAt, email, name, title, ImageUrl } = dataValue;

        const blogsCard = `
<section class="text-gray-600 border-2 rounded-lg body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
        <div class="-my-8 ">
        <img class="h-20 w-20 rounded-full" src=${ImageUrl}/>
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

         <button onclick="editPost(this)"
         id=${dataKey + "edit"}
         class="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">Edit</button>
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
    } else {
      document.getElementById(
        "currentUserBlogContainer"
      ).innerHTML = `<h1 class="text-center lg:text-4xl mt-8">You Have No Blog</h1>`;
    }
  });
};

const getAllPost = () => {
  onValue(ref(database, `UID's/`), (snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapShot) => {
        const id = childSnapShot.val();
        onValue(ref(database, `Current-User-Post/${id}`), (snapshot) => {
          const isDataExist = snapshot.val();
          if (isDataExist) {
            snapshot.forEach((childSnapShot) => {
              const { blog, createdAt, email, name, title, ImageUrl } =
                childSnapShot.val();

              const blogsCard = `
<section class="text-gray-600 border-2 rounded-lg body-font overflow-hidden">
    <div class="container px-5 py-24 mx-auto">
        <div class="-my-8">
        <img class="h-20 w-20 rounded-full" src=${ImageUrl}/>
            <div class="py-8 flex flex-wrap md:flex-nowrap">
                <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                    <span class="font-semibold title-font text-gray-700">${name}</span>
                    <span class="font-semibold title-font text-gray-700">${email}</span>
                    <span class="mt-1 text-gray-500 text-sm">${createdAt}</span>
                </div>
                <div class="md:flex-grow">
                    <h2 class="text-2xl font-bold text-gray-900 title-font mb-2">${title}</h2>
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
    } else {
      document.getElementById("allBlogContainer");
      allBlogContainer.innerHTML = `<h1 class="text-center lg:text-4xl mt-8">You Have No Blog</h1>`;
    }
  });
};

const deleteCurrent = (btn) => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: true,
  });
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        swalWithBootstrapButtons.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });

        const elemntID = btn.id;
        const postRef = ref(
          database,
          `Current-User-Post/${auth.currentUser.uid}/${elemntID}`
        );
        remove(postRef);
        document.getElementById("currentUserBlogContainer").innerHTML = null;
        getCurrentUserBlogs();
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error",
        });
      }
    });
};

const editPost = (btn) => {
  // const editContainer = document.getElementById("editContainer");
  // editContainer.style.display = "block";
  const postId = btn.id.slice(0, btn.id.length - 4);
  const postRef = ref(
    database,
    `Current-User-Post/${auth.currentUser.uid}/${postId}`
  );
  onValue(postRef, async (snapshot) => {
    const { blog } = snapshot.val();
    const newpost = prompt("Edit", blog);
    console.log(blog);
    console.log(newpost);
    update(postRef, {
      ...snapshot.val(),
      blog: newpost,
      createdAt: new Date().toLocaleDateString(),
    });
    await Swal.fire({
      position: "top-100px",
      icon: "success",
      title: "Blog Updated Successfully",
      showConfirmButton: false,
      timer: 3000,
    });

    document.getElementById("currentUserBlogContainer").innerHTML = null;
    getCurrentUserBlogs();
  });
};

const sbc = () => {
  const message = document.getElementById("message");
  console.log(message.value);
};
window.signup = signup;
window.login = login;
window.logOut = logOut;
window.postBlog = postBlog;
window.deleteCurrent = deleteCurrent;
window.editPost = editPost;
window.sbc = sbc;
