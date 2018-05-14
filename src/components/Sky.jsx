import React from 'react';
import { skyAndGroundWidth, gameHeight } from "../utils/constants";

const Sky = () => {
  const skyStyle = {
    fill: '#30abef',
  };
  const skyWidth = skyAndGroundWidth;
  return (
    <rect
      style={skyStyle}
      x={skyWidth / -2}
      y={100 - gameHeight}
      width={skyWidth}
      height={gameHeight}
    />
  );
};

export default Sky;