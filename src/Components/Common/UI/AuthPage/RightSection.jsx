import React from "react";
import LoginSideImg from "../../../../assets/LoginSideImg.png";

export const RightSection = () => {
  return (
    <>
      <div className="flex-1 bg-[#7EC2F3] rounded-xl p-4 flex flex-col justify-center items-center gap-4">
        <div className="w-full">
          <h3 className="text-[#34495E] font-[Poppins] font-[800] uppercase text-[3vw]">
            Logo
          </h3>
        </div>
        <div className="w-[70%] h-[60dvh]">
          <img
            className="w-full h-full"
            src={LoginSideImg}
            alt="LoginSideImg"
          />
        </div>
        <div className="w-full">
          <h3 className="text-[2vw] text-[#34495E] font-[Poppins] font-[800]">
            Lorem ipsum
          </h3>
          <p className="text-[#505050] text-[1.2vw] font-[Poppins] font-[400] leading-normal">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
            lectus nec enim tempor suscipit.
          </p>
        </div>
      </div>
    </>
  );
};
