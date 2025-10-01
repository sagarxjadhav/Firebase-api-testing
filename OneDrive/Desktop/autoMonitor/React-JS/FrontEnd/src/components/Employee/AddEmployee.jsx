// // src/components/AddEmployee.js


import React, { useState } from "react";
import { addEmployee } from "../../../../BackEnd/db/firebase-curd"; // Import the addEmployee function
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    name: "",
    startingDate: "",
    age: 0,
    salary: 0,
    contactInfo: "",
    address: "",
  });
  const [error, setError] = useState(""); // For form validation errors
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  // Validate form
  const validateForm = () => {
    if (!employee.name || !employee.startingDate || !employee.contactInfo) {
      setError("Name, Starting Date, and Contact Info are required.");
      return false;
    }
    if (employee.age <= 0 || employee.salary < 0) {
      setError("Age and Salary must be valid numbers.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(error); // Show error toast if validation fails
      return;
    }
    try {
      console.log("Submitting employee data:", employee); // Log the data
      await addEmployee(employee);
      toast.success("Employee added successfully!"); // Show success toast
      setTimeout(() => {
        navigate("/table"); // Redirect to EmployeeTable after 2 seconds
      }, 2000);
    } catch (err) {
      console.error("Error adding employee:", err); // Log the error
      toast.error("Failed to add employee. Please try again."); // Show error toast
    }
  };

  return (
    <div className="add-employee-container">
      <h1>Add Employee</h1>
      <form onSubmit={handleSubmit} className="add-employee-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={employee.name}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="startingDate"
          value={employee.startingDate}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={employee.age}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={employee.salary}
          onChange={handleChange}
        />
        <input
          type="text"
          name="contactInfo"
          placeholder="Contact Info"
          value={employee.contactInfo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={employee.address}
          onChange={handleChange}
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">
          Add Employee
        </button>
      </form>
      <ToastContainer /> {/* Render Toastify container */}
    </div>
  );
};

export default AddEmployee;