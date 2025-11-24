import { Camera } from 'lucide-react'
import React from 'react'
import { Layout } from '../../Components/Common/layout/Layout'
import Navbar from '../../Components/Common/Navbar/Navbar'
import { Avatar } from '@mui/material'

export const EditEmployee = () => {
  return (
    <>
        <Layout>
        <div className="w-full h-full">
          <Navbar />
          <div className="flex justify-between gap-4">
            <div className=" py-2 px-3 flex-1">
              <h3 className="text-[#1F3A93] font-[Poppins] font-[700] text-[1.4dvw] m-4">
                Update Emplyee
              </h3>

              <div className="border border-[#BDC3C7] rounded-lg p-6 flex justify-start items-start gap-10 bg-white w-full">
                <div className="w-[50%] flex flex-col gap-4">
                  <div className="flex flex-col gap-3 ">
                    <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                      Username
                    </label>
                    <input
                      className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                      type="text"
                      placeholder="username"
                      name="userName"
                      // onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Email
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="email"
                        name="email"
                        //   onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Phone Number
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="phone number"
                        name="phoneNumber"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Country
                      </label>
                      <select
                        name="country"
                        //   onChange={handleChange}
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        required
                      >
                        <option value={null}>Country</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="INDIA">INDIA</option>
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Address
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="Address"
                        name="email"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Password
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="password"
                        placeholder="*******"
                        name="password"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Address
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="date"
                        name="dateOfBirth"
                        // onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Experience
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="Experience"
                        name="email"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Designation
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="Designation"
                        name="designation"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col gap-3">
                      <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                        Employment Type
                      </label>
                      <input
                        className="w-full border border-[#BDC3C7] rounded-lg font-[Poppins] font-[500] text-[.9vw]"
                        type="text"
                        placeholder="Employment Type"
                        name="employmentType"
                        //   onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button className="px-4 py-3 font-[Poppins] font-[500] text-[1.1dvw] bg-blue-700 text-white rounded-md my-4">
                    Save Changes
                  </button>
                </div>
                <div>
                <label className="font-[Poppins] font-[500] text-[1dvw] text-[#333333]">
                    Profile Picture
                </label>
                  <div className="border border-[#BDC3C7] bg-white rounded-full p-3 relative my-4">
                    <Avatar
                      sx={{
                        height: "10dvw",
                        width: "10dvw",
                      }}
                    />

                    <button className="absolute bottom-0 right-0 bg-blue-700 text-white rounded-full h-[2.5dvw] w-[2.5dvw] flex justify-center items-center">
                      <Camera />
                      <input hidden type="file" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
