import React, { useState } from "react";
import Axios from "axios";

const CreateTacGia = () => {
  const [tenTacGia, setTenTacGia] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const authorData = {
      tenTacGia,
      image,
    };

    try {
      const res = await Axios.post(
        "http://localhost:8080/api/tacgia/createtacgia",
        authorData
      );
      if (res.status === 200) {
        alert("Thêm tác giả thành công");
        window.location.href = "/tac-gia";
      } else {
        alert("Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error adding author:", error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div className="m-8">
      <div className="mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Thêm Tác Giả Mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Tên Tác Giả
            </label>
            <input
              type="text"
              value={tenTacGia}
              onChange={(e) => setTenTacGia(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Ảnh</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Thêm Tác Giả
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTacGia;
