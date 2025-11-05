import React from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import VecIcon from "../../assets/VecIcon.png";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const ViewTask = () => {
  const route = useNavigate();
  return (
    <>
      <Layout>
        <div className="w-full h-full">
          <Navbar />
          <div className="flex flex-col justify-between gap-4 flex-1 px-5 py-2">
            <h3 className="font-[Poppins] font-[600] text-[#1F3A93] text-[1.2vw]">
              Employee Overview
            </h3>
            <div className="w-full flex  border border-[#BDC3C7] rounded-lg p-3 my-2">
              <div className="flex justify-start items-center gap-3 w-[40%] ">
                <div className="h-40 flex-shrink-0">
                  <img
                    src={VecIcon}
                    className="w-[160px] h-[160px]"
                    alt="Profile"
                  />
                </div>
                <div className="flex-1 p-2 flex flex-col justify-start gap-3 items-start">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-[1.3vw] text-[#34495E] font-[Poppins] font-[600]">
                      Sasanka Roy
                    </h3>
                    <span className="px-4 py-1 text-white bg-[#2ECC71] rounded-full text-[.8vw]">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-start items-center gap-2">
                    <span>
                      <svg
                        width="12"
                        height="16"
                        viewBox="0 0 12 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.74333 14.5407C5.14733 14.874 5.56867 15.1787 6 15.476C6.43226 15.1826 6.85155 14.8705 7.25667 14.5407C7.932 13.9861 8.56756 13.3849 9.15867 12.7413C10.5213 11.2513 12 9.09132 12 6.66666C12 5.87873 11.8448 5.09851 11.5433 4.37056C11.2417 3.6426 10.7998 2.98117 10.2426 2.42402C9.68549 1.86686 9.02405 1.42491 8.2961 1.12338C7.56815 0.821851 6.78793 0.666656 6 0.666656C5.21207 0.666656 4.43185 0.821851 3.7039 1.12338C2.97595 1.42491 2.31451 1.86686 1.75736 2.42402C1.20021 2.98117 0.758251 3.6426 0.456723 4.37056C0.155195 5.09851 -1.17411e-08 5.87873 0 6.66666C0 9.09132 1.47867 11.2507 2.84133 12.7413C3.43241 13.3851 4.06798 13.9859 4.74333 14.5407ZM6 8.83332C5.42536 8.83332 4.87426 8.60505 4.46794 8.19872C4.06161 7.79239 3.83333 7.24129 3.83333 6.66666C3.83333 6.09202 4.06161 5.54092 4.46794 5.13459C4.87426 4.72826 5.42536 4.49999 6 4.49999C6.57464 4.49999 7.12574 4.72826 7.53206 5.13459C7.93839 5.54092 8.16667 6.09202 8.16667 6.66666C8.16667 7.24129 7.93839 7.79239 7.53206 8.19872C7.12574 8.60505 6.57464 8.83332 6 8.83332Z"
                          fill="#505050"
                        />
                      </svg>
                    </span>
                    <p className="text-[.8vw] text-[#505050] font-[Poppins] font-[500]">
                      India
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/employee/e-signature")}
                    className="bg-[#3498DB] text-white font-[Poppins] font-[500] text-[.9vw] px-5 py-2 rounded-full flex justify-center items-center gap-3"
                  >
                    Edit Profile{" "}
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.53614 3.5L1.93081 11.1057C1.89254 11.1441 1.86492 11.1926 1.85176 11.2447L1.00878 14.6281C0.983565 14.73 1.01349 14.8383 1.08783 14.9126C1.14407 14.9689 1.2207 15 1.29909 15C1.3231 15 1.34766 14.997 1.37156 14.991L4.7551 14.1479C4.80783 14.1348 4.85574 14.1073 4.894 14.069L12.5 6.4638L9.53614 3.5Z"
                          fill="#F7F9FC"
                        />
                        <path
                          d="M14.5557 2.29231L13.6975 1.43136C13.1239 0.855936 12.1242 0.856493 11.5513 1.43136L10.5 2.48598L13.5044 5.5L14.5557 4.44538C14.8422 4.15806 15 3.77563 15 3.3689C15 2.96217 14.8422 2.57975 14.5557 2.29231Z"
                          fill="#F7F9FC"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div className="w-[30%]  flex justify-center items-center border-r border-l border-[#BDC3C7]">
                <ul className="flex flex-col justify-start items-start gap-2">
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Role:</strong> Employee
                  </li>
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Position:</strong> Developer
                  </li>
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Experience:</strong> 1.5 years
                  </li>
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Employement : </strong> Full Time
                  </li>
                </ul>
              </div>

              <div className="w-[30%]  flex justify-center items-center  p-3">
                <ul className="flex flex-col justify-start items-start gap-2">
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Email:</strong> sasanka@gmail.com
                  </li>
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Phone :</strong> +1 2514759
                  </li>
                  <li className="text-[1vw] font-[Poppins] font-[400] text-[#34495E]">
                    <strong>Address:</strong> Down,town 14
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-[#BDC3C7] p-4 rounded-lg">
              <div className="p-3 flex justify-between items-center">
                <select className="border border-[#34495E]  text-[#34495E]  rounded-full font-[Poppins] font-[500] text-[.9vw] outline-none w-[15%]">
                  <option>All</option>
                  <option>7 days</option>
                  <option>15 days</option>
                  <option>30 days</option>
                </select>
                <div className="w-[50%]">
                  <div className="flex-1 flex justify-center items-center gap-3">
                    <div className="bg-[#f2f2f2]/80 flex-1 flex justify-start items-center gap-3 border border-[#BDC3C7] rounded-lg py-2 px-4">
                      <Search />
                      <input
                        type="text"
                        className="border-none outline-none bg-transparent w-full rounded-lg"
                        placeholder="Enter task...."
                      />
                    </div>
                  </div>
                </div>
                <div className="w-[20%] flex justify-center items-center gap-4">
                  <select className="border border-[#34495E] rounded-full text-[#34495E] font-[Poppins] font-[500] text-[.9vw] outline-none w-full">
                    <option>Select Priority</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div className="w-full bg-white py-2 px-1  rounded-lg shadow-sm">
                <div class="relative overflow-x-auto  sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 font-[Poppins]">
                    <thead className="text-xs text-white uppercase bg-[#34495E] dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        {/* <th className="p-4">
                          <div className="flex items-center">
                            <input
                              id="checkbox-all-search"
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </th> */}
                        <th className="px-6 py-3 border-l border-r border-[#BDC3C7]">
                          Employee Name
                        </th>
                        <th className="px-6 py-3">Task</th>
                        <th className="px-6 py-3 border-l border-r border-[#BDC3C7]">
                          Dead Line
                        </th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3 border-l border-r border-[#BDC3C7]">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        // key={employee._id}

                        className="bg-white border-b hover:bg-gray-50"
                      >
                        {/* <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </td> */}
                        <th className="px-3 py-4 font-medium text-gray-900 border-l border-r border-[#BDC3C7]">
                          Sasanka Roy
                        </th>
                        <td className="px-3 py-4">
                          <Link
                            to={"/admin/task-management/task-details/1"}
                            className="hover:text-blue-600 transition-all duration-200 ease-in-out"
                          >
                            {" "}
                            Task Title
                          </Link>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7] text-[#34495E]">
                          {/* {new Date(employee.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )} */}{" "}
                          20.05.2025
                        </td>
                        <td className="px-3 py-4 flex flex-col gap-1">
                          <p className="text-[.9vw] font-[500]">High</p>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7]">
                          <select
                            // className={`w-full border-none outline-none rounded-3xl px-3 text-white ${
                            //   employee.accountStatus === "active"
                            //     ? "bg-[#2ecc71]"
                            //     : "bg-[#e74c3c]"
                            // }`}
                            className={`w-full border-none outline-none rounded-3xl px-3 text-black `}
                          >
                            <option>Select</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        {/* <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </td> */}
                        <th className="px-3 py-4 font-medium text-gray-900 border-l border-r border-[#BDC3C7]">
                          Sasanka Roy
                        </th>
                        <td className="px-3 py-4">
                          {" "}
                          <Link
                            to={"/admin/task-management/task-details/1"}
                            className="hover:text-blue-600 transition-all duration-200 ease-in-out"
                          >
                            {" "}
                            Task Title
                          </Link>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7] text-[#34495E]">
                          {/* {new Date(employee.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )} */}{" "}
                          20.05.2025
                        </td>
                        <td className="px-3 py-4 flex flex-col gap-1">
                          <p className="text-[.9vw] font-[500]">High</p>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7]">
                          <select
                            // className={`w-full border-none outline-none rounded-3xl px-3 text-white ${
                            //   employee.accountStatus === "active"
                            //     ? "bg-[#2ecc71]"
                            //     : "bg-[#e74c3c]"
                            // }`}
                            className={`w-full border-none outline-none rounded-3xl px-3 text-black `}
                          >
                            <option>Select</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        {/* <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </td> */}
                        <th className="px-3 py-4 font-medium text-gray-900 border-l border-r border-[#BDC3C7]">
                          Sasanka Roy
                        </th>
                        <td className="px-3 py-4">
                          {" "}
                          <Link
                            to={"/admin/task-management/task-details/1"}
                            className="hover:text-blue-600 transition-all duration-200 ease-in-out"
                          >
                            {" "}
                            Task Title
                          </Link>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7] text-[#34495E]">
                          {/* {new Date(employee.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )} */}{" "}
                          20.05.2025
                        </td>
                        <td className="px-3 py-4 flex flex-col gap-1">
                          <p className="text-[.9vw] font-[500]">High</p>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7]">
                          <select
                            // className={`w-full border-none outline-none rounded-3xl px-3 text-white ${
                            //   employee.accountStatus === "active"
                            //     ? "bg-[#2ecc71]"
                            //     : "bg-[#e74c3c]"
                            // }`}
                            className={`w-full border-none outline-none rounded-3xl px-3 text-black `}
                          >
                            <option>Select</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        {/* <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </td> */}
                        <th className="px-3 py-4 font-medium text-gray-900 border-l border-r border-[#BDC3C7]">
                          Sasanka Roy
                        </th>
                        <td className="px-3 py-4">
                          {" "}
                          <Link
                            to={"/admin/task-management/task-details/1"}
                            className="hover:text-blue-600 transition-all duration-200 ease-in-out"
                          >
                            {" "}
                            Task Title
                          </Link>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7] text-[#34495E]">
                          {/* {new Date(employee.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )} */}{" "}
                          20.05.2025
                        </td>
                        <td className="px-3 py-4 flex flex-col gap-1">
                          <p className="text-[.9vw] font-[500]">High</p>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7]">
                          <select
                            // className={`w-full border-none outline-none rounded-3xl px-3 text-white ${
                            //   employee.accountStatus === "active"
                            //     ? "bg-[#2ecc71]"
                            //     : "bg-[#e74c3c]"
                            // }`}
                            className={`w-full border-none outline-none rounded-3xl px-3 text-black `}
                          >
                            <option>Select</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                      </tr>
                      <tr className="bg-white border-b hover:bg-gray-50">
                        {/* <td className="w-4 p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                        </td> */}
                        <th className="px-3 py-4 font-medium text-gray-900 border-l border-r border-[#BDC3C7]">
                          Sasanka Roy
                        </th>
                        <td className="px-3 py-4">
                          {" "}
                          <Link
                            to={"/admin/task-management/task-details/1"}
                            className="hover:text-blue-600 transition-all duration-200 ease-in-out"
                          >
                            {" "}
                            Task Title
                          </Link>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7] text-[#34495E]">
                          {/* {new Date(employee.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )} */}{" "}
                          20.05.2025
                        </td>
                        <td className="px-3 py-4 flex flex-col gap-1">
                          <p className="text-[.9vw] font-[500]">High</p>
                        </td>
                        <td className="px-3 py-4 border-l border-r border-[#BDC3C7]">
                          <select
                            // className={`w-full border-none outline-none rounded-3xl px-3 text-white ${
                            //   employee.accountStatus === "active"
                            //     ? "bg-[#2ecc71]"
                            //     : "bg-[#e74c3c]"
                            // }`}
                            className={`w-full border-none outline-none rounded-3xl px-3 text-black `}
                          >
                            <option>Select</option>
                            <option value="active">active</option>
                            <option value="inactive">inactive</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
