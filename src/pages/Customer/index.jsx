/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      fetch("http://localhost:8080/api/auth/getalltaikhoan")
        .then((response) => response.json())
        .then((data) => {
          // Lọc các tài khoản có role khác admin
          const filteredCustomers = data.filter(customer => customer.role !== 'admin');
          setCustomers(filteredCustomers);

          // Lọc các tài khoản có role là admin
          const filteredAdmins = data.filter(admin => admin.role === 'admin');
          setAdmins(filteredAdmins);
        });
    }

    fetchCustomers();
  }, []);

  const handleCustomerSearchChange = (e) => {
    setCustomerSearchQuery(e.target.value);
  };

  const handleAdminSearchChange = (e) => {
    setAdminSearchQuery(e.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const filteredAdmins = admins.filter(admin =>
    admin.username.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
  );

  const customerHeaders = [
    {
      label: "ID",
      className: "relative w-12 px-6 sm:w-16 sm:px-8",
      render: (item) => item.id,
    },
    {
      label: "Username",
      className: "px-3 py-4 text-left text-sm font-semibold tracking-wide text-slate-900 whitespace-nowrap",
      render: (item) => item.username,
    },
    {
      label: "Email",
      className: "pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap sm:pr-6",
      render: (item) => item.email,
    },
    {
      label: "Giới tính",
      className: "pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap sm:pr-6",
      render: (item) => item.gioiTinh,
    },
  ];

  return (
    <div className="m-8">
      <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Quản lý khách hàng</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <input
            className="appearance-none w-full border border-slate-300 p-2 rounded-md disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tìm kiếm"
            value={customerSearchQuery}
            onChange={handleCustomerSearchChange}
          />
        </div>
      </div>

      <div className="p-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-md sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <DataTable data={filteredCustomers} headers={customerHeaders} />
          </div>
        </div>
      </div>

      <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Tài khoản quản trị viên</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <input
            className="w-full border p-2 rounded-md disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tìm kiếm"
            value={adminSearchQuery}
            onChange={handleAdminSearchChange}
          />
        </div>
      </div>

      <div className="p-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-md sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <DataTable data={filteredAdmins} headers={customerHeaders} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customer;