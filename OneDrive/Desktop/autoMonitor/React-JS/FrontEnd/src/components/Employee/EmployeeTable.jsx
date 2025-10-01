
// export default EmployeeTable;
import React, { useEffect, useState } from "react";
import { getEmployees, deleteEmployee } from "../../../../BackEnd/db/firebase-curd";
import { useNavigate } from "react-router-dom";

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
      alert("Employee deleted successfully!");
      fetchEmployees(); // Refresh table
    }
  };

  return (
    <div className="employee-table-container">
      <h1>Employee Data</h1>
      <button className="add-employee-btn" onClick={() => navigate("/add")}>
        Add Employee
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Starting Date</th>
            <th>Age</th>
            <th>Salary</th>
            <th>Contact Info</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td data-label="Name">{employee.name}</td>
              <td data-label="Starting Date">{employee.startingDate}</td>
              <td data-label="Age">{employee.age}</td>
              <td data-label="Salary">{employee.salary}</td>
              <td data-label="Contact Info">{employee.contactInfo}</td>
              <td data-label="Address">{employee.address}</td>
              <td data-label="Actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit/${employee.id}`)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(employee.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;