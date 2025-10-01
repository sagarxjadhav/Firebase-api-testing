import { db, auth } from "../Firebase/firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

// Get the current user's email
const getUserEmail = () => {
  const user = auth.currentUser;
  if (user) {
    return user.email;
  }
  throw new Error("No user is logged in.");
};

// Add a new employee under the current user's collection
export const addEmployee = async (employeeData) => {
  try {
    const userEmail = getUserEmail();
    const userRef = doc(db, "users", userEmail);
    const empRef = collection(userRef, "employees");
    await addDoc(empRef, employeeData);
    console.log("Employee added successfully!");
  } catch (err) {
    console.error("Error adding employee:", err);
  }
};

// Get all employees under the current user's collection
export const getEmployees = async () => {
  try {
    const userEmail = getUserEmail();
    const empRef = collection(db, "users", userEmail, "employees");
    const querySnapshot = await getDocs(empRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
};

// Update an existing employee
export const updateEmployee = async (id, updatedData) => {
  try {
    const userEmail = getUserEmail();
    const empRef = doc(db, "users", userEmail, "employees", id);
    await updateDoc(empRef, updatedData);
    console.log("Employee updated successfully!");
  } catch (err) {
    console.error("Error updating employee:", err);
  }
};

// Delete an employee
export const deleteEmployee = async (id) => {
  try {
    const userEmail = getUserEmail();
    const empRef = doc(db, "users", userEmail, "employees", id);
    await deleteDoc(empRef);
    console.log("Employee deleted successfully!");
  } catch (err) {
    console.error("Error deleting employee:", err);
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent! Check your inbox." };
  } catch (err) {
    return { success: false, message: "Failed to send reset email. Please check the email address." };
  }
};
