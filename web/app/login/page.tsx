'use client'
import React, { useState } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { Button } from 'antd';
import styles from "./page.module.css";

const Home = () => {
  const { login, authenticated, logout } = usePrivy();
    const [count, setCount] = useState(0)
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <Button type='primary' onClick={login}>登录</Button>
        </div>
    );
}

export default Home;