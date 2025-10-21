'use client'
import React, { useState } from 'react';
import styles from "./page.module.css";

const Home = () => {
  const [count, setCount] = useState(0)
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      3
    </div>
  );
}

export default Home;