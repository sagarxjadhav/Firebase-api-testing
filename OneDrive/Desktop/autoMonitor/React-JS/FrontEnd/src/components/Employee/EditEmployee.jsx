// src/components/EditEmployee.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployees, updateEmployee } from "../../../../BackEnd/db/firebase-curd";

const EditEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      const employees = await getEmployees();
      const foundEmployee = employees.find((e) => e.id === id);
      setEmployee(foundEmployee);
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateEmployee(id, employee);
    alert("Employee updated successfully!");
    navigate("/table");
  };

  if (!employee) return <p>Loading...</p>;

  return (

    <div className="update-employee-container">
    <h1>Update Employee</h1>
    <form onSubmit={handleSubmit} className="update-employee-form">
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
    <button type="submit" className="submit-btn">
          Update
        </button>
    </form>
  </div>
  );
};

export default EditEmployee;
