// src/utils/navigationRef.js
//
// Lets code outside the React tree — specifically the Axios response
// interceptor in services/api.js — trigger a client-side route change
// instead of a hard `window.location.href` reload. A hard reload can't
// carry React Router `state`, which is how this app's existing
// "return to where you were" mechanism (see utils/authRedirect.js) works,
// so an out-of-band 401 needs a way to call the real `navigate()`.
//
// Set exactly once, from App.jsx, via useNavigate(). Nothing else should
// call setNavigate().

let navigateFn = null;

export const setNavigate = (fn) => {
    navigateFn = fn;
};

export const getNavigate = () => navigateFn;
