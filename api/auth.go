package api

import (
	"encoding/json"
	"memos/api/e"
	"memos/store"
	"net/http"

	"github.com/gorilla/mux"
)

type UserSignUp struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func handleUserSignUp(w http.ResponseWriter, r *http.Request) {
	userSignup := UserSignUp{}
	err := json.NewDecoder(r.Body).Decode(&userSignup)

	if err != nil {
		e.ErrorHandler(w, "REQUEST_BODY_ERROR", "Bad request")
		return
	}

	user, err := store.CreateNewUser(userSignup.Username, userSignup.Password, "", "")

	if err != nil {
		e.ErrorHandler(w, "DATABASE_ERROR", err.Error())
		return
	}

	session, _ := SessionStore.Get(r, "session")

	session.Values["user_id"] = user.Id
	session.Save(r, w)

	json.NewEncoder(w).Encode(Response{
		Succeed: true,
		Message: "",
		Data:    user,
	})
}

type UserSignin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func handleUserSignIn(w http.ResponseWriter, r *http.Request) {
	userSignin := UserSignin{}
	err := json.NewDecoder(r.Body).Decode(&userSignin)

	if err != nil {
		e.ErrorHandler(w, "REQUEST_BODY_ERROR", "Bad request")
		return
	}

	user, err := store.GetUserByUsernameAndPassword(userSignin.Username, userSignin.Password)

	if err != nil {
		e.ErrorHandler(w, "DATABASE_ERROR", err.Error())
		return
	}

	session, _ := SessionStore.Get(r, "session")

	session.Values["user_id"] = user.Id
	session.Save(r, w)

	json.NewEncoder(w).Encode(Response{
		Succeed: true,
		Message: "",
		Data:    user,
	})
}

func handleUserSignOut(w http.ResponseWriter, r *http.Request) {
	session, _ := SessionStore.Get(r, "session")

	session.Values["user_id"] = ""
	session.Save(r, w)

	json.NewEncoder(w).Encode(Response{
		Succeed: true,
		Message: "",
		Data:    nil,
	})
}

func RegisterAuthRoutes(r *mux.Router) {
	authRouter := r.PathPrefix("/api/auth").Subrouter()

	authRouter.HandleFunc("/signup", handleUserSignUp).Methods("POST")
	authRouter.HandleFunc("/signin", handleUserSignIn).Methods("POST")
	authRouter.HandleFunc("/signout", handleUserSignOut).Methods("POST")
}
