import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { BASE_URL } from '../../common/api/localhost';

function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchFeedbacks() {
      fetch(`${BASE_URL}/api/feedback/laytatcafeedback`)
        .then((response) => response.json())
        .then((data) => {
          setFeedbacks(data);
        });
    }

    async function fetchBooks() {
      fetch(`${BASE_URL}/api/sach/getallsach`)
        .then((response) => response.json())
        .then((data) => {
          setBooks(data);
        });
    }

    fetchFeedbacks();
    fetchBooks();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.tenTaiKhoan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.noiDung.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBookTitleById = (id) => {
    const book = books.find((book) => book.id === id);
    return book ? book.tieuDe : 'Unknown';
  };

  const feedbackHeaders = [
    {
      label: 'ID',
      className: 'relative w-12 px-6 sm:w-16 sm:px-8',
      render: (item) => item.id,
    },
    {
      label: 'Tên tài khoản',
      className: 'px-3 py-4 text-left text-sm font-semibold tracking-wide text-slate-900 whitespace-nowrap',
      render: (item) => item.tenTaiKhoan,
    },
    {
      label: 'Sách',
      className: 'pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-normal sm:pr-6',
      render: (item) => getBookTitleById(item.sachId),
    },
    {
      label: 'Nội dung',
      className: 'pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-normal sm:pr-6',
      render: (item) => item.noiDung,
    },
    {
      label: 'Số sao',
      className: 'pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap sm:pr-6',
      render: (item) => item.soSao,
    },
    {
      label: 'Ngày feedback',
      className: 'pl-3 pr-4 py-4 text-left text-sm tracking-wide text-slate-900 whitespace-nowrap sm:pr-6',
      render: (item) => new Date(item.ngayFeedback).toLocaleDateString(),
    },
  ];

  return (
    <div className="m-8">
      <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Quản lý phản hồi</h1>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <input
            className="appearance-none w-full border border-slate-300 p-2 pl-10 rounded-md disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tìm kiếm phản hồi"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="p-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-md sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="relative max-w-sm text-slate-400">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  ></path>
                </svg>
              </div>
              <input
                className="appearance-none w-full border border-slate-300 p-2 pl-10 rounded-md disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Tìm kiếm phản hồi"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <DataTable data={filteredFeedbacks} headers={feedbackHeaders} />
        </div>
      </div>
    </div>
  );
}

export default FeedbackManagement;
