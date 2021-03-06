import React from "react";
import styled, { keyframes } from "styled-components";
import { Logo } from "./Icons";

const Animation = keyframes`
    0%{
        opacity:0
    }
    50%{
        opacity:1
    }
    100%{
        opacity:0;
    }
`;
const Loading = styled.div`
  padding-top: 100px;
  margin: 20px auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${Animation} 1s linear infinite;
`;

const Loader = () => {
  return (
    <Loading>
      <Logo size={50} />
    </Loading>
  );
};

export default Loader;
