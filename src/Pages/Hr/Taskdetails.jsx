import React from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Avatar } from "@mui/material";

export const Taskdetails = () => {
  return (
    <Layout>
      <div className='w-full h-full'>
        <Navbar />
      </div>
      <div className="flex justify-center gap-4">
        <div className="flex-1 py-2 px-3">
          {/* heading */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-[#1F3A93] font-[Poppins] font-[700] ">
                Task Details
              </h3>
            </div>
          </div>

          <div className="w-full flex flex-col gap-5  border border-[#BDC3C7] rounded-lg p-3 my-4 bg-white">
            <div className="px-5 py-7 flex flex-col gap-4 border border-[#BDC3C7] rounded-md">
              <h3>
                Assigned To :{" "}
                <span className="text-[1.2dvw] font-[600]"> Sasanka Roy</span>,{" "}
                <span className="text-[1dvw] font-[400]">Employee</span>
              </h3>
              <h3>
                Assigned By :{" "}
                <span className="text-[1.2dvw] font-[600]"> Indranil Roy</span>,{" "}
                <span className="text-[1dvw] font-[400]">Manager</span>
              </h3>

              <h3>
                Task Title :{" "}
                <span className="text-[1.2dvw] font-[600]">
                  Create the front end for All in one{" "}
                </span>
              </h3>
              <h3>
                Dead Line :{" "}
                <span className="text-[1.2dvw] font-[600]">10 May 2025 </span>
              </h3>
              <h3>
                Priority Level :{" "}
                <span className="text-[1.2dvw] font-[600] text-green-500">
                  Normal{" "}
                </span>
              </h3>
              <h3>Task Description : </h3>
              <div className="px-4">
                <p className="font-[400] font-[Poppins] text-[1dvw]">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#BDC3C7]/50 rounded-md">
              <h4 className="text-[1.3dvw] font-[600]">
                Daily updates and Comments
              </h4>
            </div>

            <div className="w-full flex flex-col gap-4 items-start">
              <div className="max-h-[60dvh] overflow-y-auto bg-[#BDC3C7]/15 rounded-md border border-[#BDC3C7] p-6 w-full flex flex-col gap-4 justify-start items-start">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cur, id) => (
                  <div
                    key={id}
                    className="w-auto p-2 flex justify-start items-start gap-3"
                  >
                    <Avatar />
                    <div className="bg-[#BDC3C7]/60 p-4 rounded-xl shadow">
                      <div className="flex justify-start items-center gap-2">
                        <h4 className="font-[600] font-[Poppins] text-[1dvw]">
                          Sasanka Roy
                        </h4>
                        <span className="text-[.95dvw] font-[500] font-[Popppins]">
                          29.04.25
                        </span>
                      </div>
                      <p className="font-[500] font-[Poppins] text-[1.1dvw] my-2">
                        Creating the task-management task-details page today.{" "}
                        {cur}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full">
                <textarea
                  placeholder="Write comments..."
                  className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                  rows={5}
                  // onChange={handleOnChange}
                  // value={addNewTask.description}
                  name="description"
                ></textarea>
              </div>
              <div className="flex justify-start items-center gap-5">
                <button className="bg-[#1F3A93] px-7 py-2 rounded-full text-white font-[Poppins] font-[500] text-[1.1dvw] w-auto hover:text-[#1F3A93] hover:bg-white transition-all duration-200 ease-linear border border-[#1F3A93] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-70">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
