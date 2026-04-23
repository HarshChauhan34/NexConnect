export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

export const validateEmail = (email) => emailRegex.test(email || "");

export const validateStrongPassword = (password) =>
  passwordRegex.test(password || "");
